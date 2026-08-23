"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import dynamic from "next/dynamic";
import { AlertCircle, Check, ChevronDown, CirclePlus, GripVertical, Save, Trash2 } from "lucide-react";
import { saveSectionAction } from "@/app/actions/sites";
import { SaveSuccessNotice } from "@/components/editor/save-success-notice";
import { useSaveSuccessNotice } from "@/components/editor/use-save-success-notice";
import { useRegisterDirty } from "@/components/editor/unsaved-changes";
import { PageHeading } from "@/components/ui/page-heading";
import { editorFields, getSection } from "@/lib/site-sections";
import { buildRepeatableItems, moveRepeatableItem, serializeRepeatableItems, type RepeatableItem } from "@/lib/repeatable-items";
import { repeatableContent } from "@/lib/repeatable-content";
import { civicIconOptions, getCivicIconOption, type CivicIconName } from "@/lib/civic-icons";

const RichTextEditor = dynamic(
  () => import("@/components/editor/rich-text-editor").then((module) => module.RichTextEditor),
  { loading: () => <div className="rich-text-editor rich-text-editor--loading" role="status">Načítavam editor…</div>, ssr: false },
);

type SectionFormProps = {
  siteId: string;
  sectionSlug: string;
  initialValues: Record<string, string>;
  initialRevision: number;
};

type SaveState = "saved" | "dirty" | "saving" | "error";

export function SectionForm({ siteId, sectionSlug, initialValues, initialRevision }: SectionFormProps) {
  const section = getSection(sectionSlug);
  if (!section) throw new Error(`Neznáma sekcia: ${sectionSlug}`);

  const fields = editorFields[section.slug] ?? [];
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveMessage, setSaveMessage] = useState("");
  const [revisionConflict, setRevisionConflict] = useState(false);
  const repeatable = repeatableContent[section.slug];
  const maxItems = repeatable?.maxItems ?? 12;
  const [items, setItems] = useState<RepeatableItem[]>(() => buildRepeatableItems(repeatable?.items ?? [], initialValues));
  const itemsRef = useRef(items);
  const [expandedDetailIds, setExpandedDetailIds] = useState<Set<string>>(
    () => new Set(items.filter((item) => item.detail?.trim()).map((item) => item.id)),
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [openIconPickerId, setOpenIconPickerId] = useState<string | null>(null);
  const [reorderMessage, setReorderMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const revisionRef = useRef(initialRevision);
  const revisionConflictRef = useRef(false);
  const savingRef = useRef(false);
  const activeDragIdRef = useRef<string | null>(null);
  const pendingFocusIdRef = useRef<string | null>(null);
  const newItemSequenceRef = useRef(0);
  const dirtySourceId = `section:${sectionSlug}`;

  useRegisterDirty(dirtySourceId, saveState === "dirty" || saveState === "error");
  const { noticeVisible, noticeMessage } = useSaveSuccessNotice(saveState);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (!pendingFocusIdRef.current || !formRef.current) return;
    const row = formRef.current.querySelector<HTMLElement>(`[data-repeatable-id="${pendingFocusIdRef.current}"]`);
    row?.querySelector<HTMLElement>("input, .drag-handle")?.focus();
    pendingFocusIdRef.current = null;
  }, [items]);

  function markDirty() {
    if (revisionConflictRef.current) return;
    setSaveState("dirty");
    setSaveMessage("");
  }

  async function flushChanges() {
    if (revisionConflictRef.current || savingRef.current || !formRef.current) return;
    savingRef.current = true;
    setSaveState("saving");
    setSaveMessage("");
    const values = Object.fromEntries(
      Array.from(new FormData(formRef.current).entries()).map(([key, value]) => [key, String(value)]),
    );
    if (repeatable) {
      for (const key of Object.keys(values)) {
        if (key === "items_count" || /^item_\d+_(?:title|text|detail|icon)$/.test(key)) delete values[key];
      }
      Object.assign(values, serializeRepeatableItems(itemsRef.current));
    }
    const result = await saveSectionAction({ siteId, sectionSlug, revision: revisionRef.current, values });
    savingRef.current = false;

    if (!result.ok) {
      if (result.conflict) {
        revisionConflictRef.current = true;
        setRevisionConflict(true);
        if (result.currentRevision) revisionRef.current = result.currentRevision;
      }
      setSaveState("error");
      setSaveMessage(result.message);
      return;
    }

    revisionRef.current = result.revision;
    setSaveMessage("");
    setSaveState("saved");
  }

  const saveStateRef = useRef(saveState);
  const flushChangesRef = useRef(flushChanges);

  useEffect(() => {
    saveStateRef.current = saveState;
    flushChangesRef.current = flushChanges;
  });

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      if (saveStateRef.current === "dirty" && !revisionConflictRef.current) void flushChangesRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function reloadForConflict() {
    window.location.reload();
  }

  function announceMove(item: RepeatableItem, targetIndex: number) {
    setReorderMessage(`${item.title || "Položka"} je teraz na pozícii ${targetIndex + 1} z ${itemsRef.current.length}.`);
  }

  function replaceItems(next: RepeatableItem[]) {
    itemsRef.current = next;
    setItems(next);
  }

  function moveItem(itemId: string, targetIndex: number) {
    const current = itemsRef.current;
    const item = current.find((candidate) => candidate.id === itemId);
    const next = moveRepeatableItem(current, itemId, targetIndex);
    if (item && next !== current) announceMove(item, targetIndex);
    replaceItems(next);
    pendingFocusIdRef.current = itemId;
    markDirty();
  }

  function addItem() {
    const current = itemsRef.current;
    if (current.length >= maxItems) return;
    const id = `new-${newItemSequenceRef.current++}`;
    replaceItems([...current, { id, icon: repeatable?.defaultIcon ?? "governance", title: "", text: "", ...(repeatable?.supportsDetails ? { detail: "" } : {}) }]);
    pendingFocusIdRef.current = id;
    setReorderMessage(`Pridaná nová položka na pozíciu ${current.length + 1}.`);
    markDirty();
  }

  function removeItem(itemId: string) {
    const current = itemsRef.current;
    const currentIndex = current.findIndex((item) => item.id === itemId);
    const item = current[currentIndex];
    const nextFocus = current[currentIndex + 1]?.id ?? current[currentIndex - 1]?.id ?? null;
    replaceItems(current.filter((candidate) => candidate.id !== itemId));
    setExpandedDetailIds((expanded) => {
      const next = new Set(expanded);
      next.delete(itemId);
      return next;
    });
    setOpenIconPickerId((openId) => openId === itemId ? null : openId);
    pendingFocusIdRef.current = nextFocus;
    setReorderMessage(`${item?.title || "Položka"} bola odstránená.`);
    markDirty();
  }

  function updateItem(itemId: string, field: "detail" | "title" | "text", value: string) {
    replaceItems(itemsRef.current.map((item) => item.id === itemId ? { ...item, [field]: value } : item));
    markDirty();
  }

  function chooseItemIcon(itemId: string, icon: CivicIconName) {
    replaceItems(itemsRef.current.map((item) => item.id === itemId ? { ...item, icon } : item));
    setOpenIconPickerId(null);
    markDirty();
  }

  function updateItemDetail(itemId: string, value: string) {
    setItems((current) => current.map((item) => item.id === itemId ? { ...item, detail: value } : item));
    markDirty();
  }

  function toggleItemDetail(itemId: string) {
    setExpandedDetailIds((expanded) => {
      const next = new Set(expanded);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function handleMoveKey(event: KeyboardEvent<HTMLButtonElement>, itemId: string) {
    const currentIndex = itemsRef.current.findIndex((item) => item.id === itemId);
    if (event.key === "ArrowUp" && currentIndex > 0) {
      event.preventDefault();
      moveItem(itemId, currentIndex - 1);
    }
    if (event.key === "ArrowDown" && currentIndex < itemsRef.current.length - 1) {
      event.preventDefault();
      moveItem(itemId, currentIndex + 1);
    }
  }

  function beginPointerMove(event: PointerEvent<HTMLButtonElement>, itemId: string) {
    activeDragIdRef.current = itemId;
    setDraggedId(itemId);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function continuePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const itemId = activeDragIdRef.current;
    if (!itemId) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-repeatable-id]");
    const targetId = target?.dataset.repeatableId;
    if (!targetId || targetId === itemId) return;
    const targetIndex = itemsRef.current.findIndex((item) => item.id === targetId);
    if (targetIndex < 0) return;
    replaceItems(moveRepeatableItem(itemsRef.current, itemId, targetIndex));
  }

  function endPointerMove(event: PointerEvent<HTMLButtonElement>, itemId: string) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    activeDragIdRef.current = null;
    setDraggedId(null);
    const targetIndex = itemsRef.current.findIndex((item) => item.id === itemId);
    const item = itemsRef.current[targetIndex];
    if (item && targetIndex >= 0) announceMove(item, targetIndex);
    pendingFocusIdRef.current = itemId;
    markDirty();
  }

  const busy = saveState === "saving";

  return (
    <div className="page-container">
      <PageHeading eyebrow="Obsah webu" title={section.label} description={section.description} action={
        <div className="section-form-actions">
          <span className="save-state" aria-live="polite">
            {saveState === "saved" && <><Check size={15} /> Všetky zmeny uložené</>}
            {saveState === "dirty" && <>Máte neuložené zmeny</>}
            {saveState === "saving" && <><Save size={15} /> Ukladám…</>}
            {saveState === "error" && <><AlertCircle size={15} /> Nepodarilo sa uložiť</>}
          </span>
          <button
            className="button button--primary button--small"
            disabled={busy || revisionConflict || saveState === "saved"}
            onClick={() => void flushChanges()}
            type="button"
          >
            <Save size={15} /> Uložiť
          </button>
        </div>
      } />

      {saveState === "error" && (
        <div className="autosave-error" role="alert">
          <AlertCircle size={18} />
          <span>{saveMessage}</span>
          {revisionConflict ? (
            <button type="button" onClick={reloadForConflict}>Obnoviť stránku</button>
          ) : (
            <button type="button" onClick={() => void flushChanges()}>Skúsiť znova</button>
          )}
        </div>
      )}

      <SaveSuccessNotice message={noticeMessage} visible={noticeVisible} />

      <form ref={formRef} className="editor-card" onChange={markDirty} onSubmit={(event) => { event.preventDefault(); void flushChanges(); }}>
        <div className="editor-card__intro">
          <span className="section-symbol"><section.icon size={21} /></span>
          <div><h2>{section.label}</h2><p>Text môžete kedykoľvek upraviť. Na verejný web sa prenesie až po jeho zverejnení.</p></div>
        </div>

        <div className="field-stack">
          {fields.map((field) => {
            const value = initialValues[field.name] ?? field.value ?? "";
            if (field.type === "checkbox") {
              return (
                <label className="toggle-field" key={field.name}>
                  <input name={field.name} type="hidden" value="false" />
                  <input defaultChecked={value !== "false"} name={field.name} type="checkbox" value="true" />
                  <span className="toggle-field__control" aria-hidden="true"><i /></span>
                  <span className="toggle-field__copy">
                    <strong>{field.label}</strong>
                    {field.hint && <small>{field.hint}</small>}
                  </span>
                </label>
              );
            }
            if (field.type === "richtext") {
              const labelId = `${section.slug}-${field.name}-label`;
              return (
                <div className="field" key={field.name}>
                  <span id={labelId}>{field.label}</span>
                  <RichTextEditor initialValue={value} labelledBy={labelId} name={field.name} onChange={markDirty} />
                  {field.hint && <small>{field.hint}</small>}
                </div>
              );
            }

            return (
              <label className="field" key={field.name}>
                <span>{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea name={field.name} defaultValue={value} rows={5} placeholder="Začnite písať…" />
                ) : (
                  <input name={field.name} type={field.type ?? "text"} defaultValue={value} placeholder={field.type === "url" ? "https://" : "Doplňte údaj"} />
                )}
                {field.hint && <small>{field.hint}</small>}
              </label>
            );
          })}
        </div>

        {repeatable && (
          <div className="repeatable-section">
            <div className="repeatable-heading"><div><h3>{repeatable.label}</h3><p id={`${section.slug}-reorder-help`}>Položky presuňte úchytom alebo na ňom použite šípky hore a dole.</p></div><button className="button button--secondary button--small" disabled={items.length >= maxItems} onClick={addItem} type="button"><CirclePlus size={16} /> Pridať</button></div>
            <input name="items_count" type="hidden" value={items.length} />
            <span className="sr-only" aria-live="polite">{reorderMessage}</span>
            <div className="repeatable-list">
              {items.map((item, index) => (
                <div className={`repeatable-item${draggedId === item.id ? " repeatable-item--dragging" : ""}`} data-repeatable-id={item.id} key={item.id}>
                  <div className="repeatable-row">
                    <button
                      aria-describedby={`${section.slug}-reorder-help`}
                      aria-label={`Presunúť ${item.title || `položku ${index + 1}`}. Pozícia ${index + 1} z ${items.length}.`}
                      className="drag-handle"
                      onKeyDown={(event) => handleMoveKey(event, item.id)}
                      onPointerCancel={(event) => endPointerMove(event, item.id)}
                      onPointerDown={(event) => beginPointerMove(event, item.id)}
                      onPointerMove={continuePointerMove}
                      onPointerUp={(event) => endPointerMove(event, item.id)}
                      title="Potiahnite alebo použite šípky hore a dole"
                      type="button"
                    ><GripVertical size={14} aria-hidden="true" /></button>
                    {(() => {
                      const selectedIcon = getCivicIconOption(item.icon, repeatable.defaultIcon);
                      const SelectedIcon = selectedIcon.Icon;
                      const pickerId = `${section.slug}-${item.id}-icon-picker`;
                      const isOpen = openIconPickerId === item.id;
                      return (
                        <div className="repeatable-icon-field">
                          <span>Ikona</span>
                          <button
                            aria-controls={pickerId}
                            aria-expanded={isOpen}
                            aria-label={`Vybrať ikonku pre ${item.title || `položku ${index + 1}`}. Aktuálne: ${selectedIcon.label}`}
                            className="repeatable-icon-trigger"
                            onClick={() => setOpenIconPickerId(isOpen ? null : item.id)}
                            title={selectedIcon.label}
                            type="button"
                          ><SelectedIcon aria-hidden="true" size={18} /></button>
                        </div>
                      );
                    })()}
                    <label className="repeatable-row__title"><span>Názov</span><input className="repeatable-title-input" name={`item_${index}_title`} onChange={(event) => updateItem(item.id, "title", event.target.value)} value={item.title} /></label>
                    <label className="repeatable-row__wide"><span>Krátky opis</span><input name={`item_${index}_text`} onChange={(event) => updateItem(item.id, "text", event.target.value)} value={item.text} /></label>
                    <button className="icon-button icon-button--danger" onClick={() => removeItem(item.id)} type="button" aria-label={`Odstrániť ${item.title || `položku ${index + 1}`}`}><Trash2 size={15} /></button>
                  </div>
                  {openIconPickerId === item.id && (
                    <div className="civic-icon-picker" id={`${section.slug}-${item.id}-icon-picker`} onKeyDown={(event) => { if (event.key === "Escape") setOpenIconPickerId(null); }} role="group" aria-label={`Ikonky pre ${item.title || `položku ${index + 1}`}`}>
                      <div className="civic-icon-picker__heading"><strong>Vyberte ikonku</strong><span>Neutrálne témy vhodné pre komunálny web</span></div>
                      <div className="civic-icon-picker__grid">
                        {civicIconOptions.map((option) => {
                          const Icon = option.Icon;
                          const selected = option.key === item.icon;
                          return (
                            <button aria-label={option.label} aria-pressed={selected} className={`civic-icon-option${selected ? " civic-icon-option--selected" : ""}`} key={option.key} onClick={() => chooseItemIcon(item.id, option.key)} title={option.label} type="button">
                              <Icon aria-hidden="true" size={19} />
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {repeatable.supportsDetails && (() => {
                    const detailButtonId = `${section.slug}-${item.id}-detail-label`;
                    const detailPanelId = `${section.slug}-${item.id}-detail-panel`;
                    const expanded = expandedDetailIds.has(item.id);
                    return (
                      <div className="repeatable-detail">
                        <button aria-controls={detailPanelId} aria-expanded={expanded} className="repeatable-detail__toggle" id={detailButtonId} onClick={() => toggleItemDetail(item.id)} type="button">
                          <ChevronDown aria-hidden="true" className={expanded ? "is-expanded" : ""} size={16} />
                          <span>Podrobný popis</span>
                          <small>{item.detail?.trim() ? "doplnený" : "voliteľné"}</small>
                        </button>
                        {expanded && (
                          <div className="repeatable-detail__panel" id={detailPanelId}>
                            <RichTextEditor
                              initialValue={item.detail ?? ""}
                              labelledBy={detailButtonId}
                              name={`item_${index}_detail`}
                              onChange={(value) => updateItemDetail(item.id, value)}
                              variant="compact"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}
              {items.length > 0 && items.length < maxItems && (
                <div className="repeatable-add">
                  <button className="button button--secondary button--small" onClick={addItem} type="button"><CirclePlus size={16} /> Pridať</button>
                </div>
              )}
              {items.length === 0 && <div className="repeatable-empty"><p>Zatiaľ tu nie je žiadna položka.</p><button className="button button--secondary button--small" onClick={addItem} type="button"><CirclePlus size={16} /> Pridať prvú položku</button></div>}
            </div>
          </div>
        )}

        <div className="editor-card__footer">
          <span className="save-state save-state--footer" aria-live="polite">
            {saveState === "saved" && <><Check size={15} /> Zmeny boli uložené</>}
            {saveState === "dirty" && <>Zmeny sa neukladajú samy — pred odchodom ich uložte.</>}
            {saveState === "saving" && <><Save size={15} /> Ukladám…</>}
            {saveState === "error" && <><AlertCircle size={15} /> Nepodarilo sa uložiť</>}
          </span>
          <button
            className="button button--primary button--small"
            disabled={busy || revisionConflict || saveState === "saved"}
            type="submit"
          >
            <Save size={15} /> Uložiť
          </button>
        </div>
      </form>
    </div>
  );
}
