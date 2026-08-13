"use client";

import { AlertCircle, Check, Eye, RotateCcw, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { saveThemeAction } from "@/app/actions/sites";
import { CampaignTemplatePreview } from "@/components/editor/campaign-template-preview";
import { useRegisterDirty } from "@/components/editor/unsaved-changes";
import { cn } from "@/lib/cn";
import {
  campaignColors,
  campaignTemplates,
  defaultCampaignTheme,
  type CampaignTemplateId,
} from "@/lib/site-theme";
import { PageHeading } from "@/components/ui/page-heading";

const hexColorPattern = /^#[0-9a-f]{6}$/i;

type AppearanceEditorProps = {
  initialRevision: number;
  initialTheme: {
    color: string;
    template: CampaignTemplateId;
  };
  siteId: string;
};

type SaveState = "saved" | "dirty" | "saving" | "error";

export function AppearanceEditor({ initialRevision, initialTheme, siteId }: AppearanceEditorProps) {
  const [color, setColor] = useState<string>(initialTheme.color);
  const [lastValidColor, setLastValidColor] = useState<string>(initialTheme.color);
  const [colorTouched, setColorTouched] = useState(false);
  const [template, setTemplate] = useState<CampaignTemplateId>(initialTheme.template);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveMessage, setSaveMessage] = useState("");
  const [revisionConflict, setRevisionConflict] = useState(false);
  const themeRef = useRef(initialTheme);
  const revisionRef = useRef(initialRevision);
  const revisionConflictRef = useRef(false);
  const savingRef = useRef(false);
  const colorIsValid = hexColorPattern.test(color);
  const previewColor = colorIsValid ? color : lastValidColor;
  const selectedTemplate = campaignTemplates.find((item) => item.id === template) ?? campaignTemplates[0];
  const isDefaultTheme = color === defaultCampaignTheme.color && template === defaultCampaignTheme.template;

  useRegisterDirty("appearance", saveState === "dirty" || saveState === "error");

  async function flushTheme() {
    if (revisionConflictRef.current || savingRef.current) return;
    if (!hexColorPattern.test(themeRef.current.color)) {
      setColorTouched(true);
      setSaveState("error");
      setSaveMessage("Zadajte platnú farbu vo formáte #163B65.");
      return;
    }
    savingRef.current = true;
    setSaveState("saving");
    setSaveMessage("");
    const result = await saveThemeAction({ siteId, revision: revisionRef.current, theme: themeRef.current });
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
  const flushThemeRef = useRef(flushTheme);

  useEffect(() => {
    saveStateRef.current = saveState;
    flushThemeRef.current = flushTheme;
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      if (saveStateRef.current === "dirty" && !revisionConflictRef.current) void flushThemeRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function reloadForConflict() {
    window.location.reload();
  }

  function markDirtyTheme(next: { color: string; template: CampaignTemplateId }) {
    if (revisionConflictRef.current) return;
    themeRef.current = next;
    setColor(next.color);
    setLastValidColor(next.color);
    setTemplate(next.template);
    setSaveState("dirty");
    setSaveMessage("");
  }

  function selectTemplate(nextTemplate: CampaignTemplateId) {
    markDirtyTheme({ ...themeRef.current, template: nextTemplate });
  }

  function selectColor(nextColor: string) {
    setColorTouched(false);
    markDirtyTheme({ ...themeRef.current, color: nextColor });
  }

  function changeCustomColor(nextColor: string) {
    setColor(nextColor);
    if (!hexColorPattern.test(nextColor)) {
      setSaveState("dirty");
      return;
    }
    themeRef.current = { ...themeRef.current, color: nextColor };
    setLastValidColor(nextColor);
    if (!revisionConflictRef.current) {
      setSaveState("dirty");
      setSaveMessage("");
    }
  }

  function resetTheme() {
    setColorTouched(false);
    markDirtyTheme(defaultCampaignTheme);
  }

  const busy = saveState === "saving";

  return (
    <div className="page-container page-container--wide">
      <PageHeading
        eyebrow="Dizajn webu"
        title="Vyberte vzhľad svojho webu"
        description="Zvoľte šablónu a farbu kampane. Obsah môžete kedykoľvek doplniť alebo zmeniť bez straty zvoleného vzhľadu."
        action={(
          <div className="section-form-actions">
            <span className="save-state" aria-live="polite">
              {saveState === "saved" && <><Check size={15} /> Vzhľad uložený</>}
              {saveState === "dirty" && <>Máte neuložené zmeny</>}
              {saveState === "saving" && <><Save size={15} /> Ukladám vzhľad…</>}
              {saveState === "error" && <><AlertCircle size={15} /> Uloženie zlyhalo</>}
            </span>
            <button
              className="button button--primary button--small"
              disabled={busy || revisionConflict || saveState === "saved"}
              onClick={() => void flushTheme()}
              type="button"
            >
              <Save size={15} /> Uložiť
            </button>
          </div>
        )}
      />
      {saveState === "error" && (
        <div className="autosave-error" role="alert">
          <AlertCircle size={18} />
          <span>{saveMessage}</span>
          {revisionConflict ? (
            <button onClick={reloadForConflict} type="button">Obnoviť stránku</button>
          ) : (
            <button onClick={() => void flushTheme()} type="button">Skúsiť znova</button>
          )}
        </div>
      )}
      <div className="appearance-grid">
        <section className="editor-card appearance-controls">
          <div className="appearance-section-heading">
            <span>1</span>
            <div><h2>Šablóna webu</h2><p>Každá šablóna obsahuje rovnaké sekcie a funguje na mobile aj počítači.</p></div>
          </div>
          <div className="template-options" role="radiogroup" aria-label="Šablóna webu">
            {campaignTemplates.map((item) => {
              const isSelected = template === item.id;

              return (
                <button
                  aria-checked={isSelected}
                  className={cn("template-option", isSelected && "template-option--active")}
                  key={item.id}
                  onClick={() => selectTemplate(item.id)}
                  role="radio"
                  type="button"
                >
                  <CampaignTemplatePreview color={previewColor} compact template={item.id} />
                  <span className="template-option__copy">
                    <span className="template-option__title">
                      <strong>{item.name}</strong>
                      {isSelected && <span><Check size={13} /> Vybrané</span>}
                    </span>
                    <small>{item.description}</small>
                    <em>{item.bestFor}</em>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="control-divider" />
          <div className="appearance-section-heading">
            <span>2</span>
            <div><h2>Farba kampane</h2><p>Použije sa na zvýraznenia webu. Ovládanie aplikácie zostane vždy navy a teal.</p></div>
          </div>
          <div className="color-options" role="radiogroup" aria-label="Farba kampane">
            {campaignColors.map((item) => {
              const isSelected = color.toLowerCase() === item.value.toLowerCase();

              return (
                <button
                  aria-checked={isSelected}
                  aria-label={`${item.name}, ${item.value}`}
                  className={cn("color-swatch", isSelected && "color-swatch--active")}
                  key={item.value}
                  onClick={() => selectColor(item.value)}
                  role="radio"
                  style={{ backgroundColor: item.value }}
                  title={item.name}
                  type="button"
                >
                  {isSelected && <Check size={18} />}
                </button>
              );
            })}
          </div>
          <label className="field" htmlFor="campaign-color">
            <span>Vlastná farba</span>
            <div className={cn("color-input", colorTouched && !colorIsValid && "color-input--invalid")}>
              <i style={{ backgroundColor: previewColor }} />
              <input
                aria-describedby="campaign-color-help"
                aria-invalid={colorTouched && !colorIsValid}
                id="campaign-color"
                maxLength={7}
                onBlur={() => setColorTouched(true)}
                onChange={(event) => changeCustomColor(event.target.value)}
                spellCheck={false}
                value={color}
              />
            </div>
            <small id="campaign-color-help">
              {colorTouched && !colorIsValid ? <span className="field-error" role="alert">Zadajte farbu vo formáte #163B65.</span> : "Použite šesťmiestny HEX kód, napríklad #163B65."}
            </small>
          </label>

          <div className="appearance-note"><Check size={16} /><span><strong>Bez príplatku</strong> Všetky tri šablóny sú dostupné v balíkoch Basic aj Plus.</span></div>
          <div className="appearance-actions">
            <button className="button button--ghost appearance-reset" disabled={isDefaultTheme} onClick={resetTheme} type="button"><RotateCcw size={16} /> Obnoviť pôvodný vzhľad</button>
            <button
              className="button button--primary"
              disabled={busy || revisionConflict || saveState === "saved"}
              onClick={() => void flushTheme()}
              type="button"
            >
              <Save size={16} /> Uložiť vzhľad
            </button>
          </div>
        </section>

        <aside aria-label="Živý náhľad vybranej šablóny" className="preview-panel">
          <div className="preview-panel__header"><span><Eye size={14} /> Živý náhľad</span><small aria-live="polite">{selectedTemplate.name}</small></div>
          <CampaignTemplatePreview color={previewColor} template={template} />
          <div className="preview-panel__footer"><Check size={14} /><span>Náhľad používa ukážkový obsah. Vaše texty a fotografie sa doplnia automaticky.</span></div>
        </aside>
      </div>
    </div>
  );
}
