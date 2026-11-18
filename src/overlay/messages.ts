export const languageOptions = [
  { id: "de", label: "Deutsch" },
  { id: "en", label: "English" },
] as const;

export type Lang = (typeof languageOptions)[number]["id"];

const de = {
  brand: "consolecheat",
  title: "Input-Overlay für Streams",
  metaDescription:
    "Input-Overlay für Streams: zeigt Tasten, Trigger und Sticks deines Controllers live als transparentes Overlay für OBS. Konfiguration nur über die URL, keine Anmeldung. Inoffiziell, nicht von Sony.",
  eyebrow: "Werkzeug · Streaming",
  lede: "Zeig deinen Zuschauern, was du drückst: Tasten, Trigger und beide Sticks live über die Gamepad-API. Stell hier Skin, Farben und Größe ein und füg den Link in OBS als Browserquelle ein. Das Overlay hat einen komplett transparenten Hintergrund.",
  freeClaim: "Komplett kostenlos. Auf dieser Seite kostet nichts Geld.",
  privacyClaim: "Keine sensiblen Daten werden gespeichert. Controller-Eingaben werden nur im Browser angezeigt und nirgendwohin gesendet.",
  unofficial: "Inoffiziell. Nicht von Sony.",
  footerNote: "Die Einstellungen stecken im Link. Diese Seite ist nicht Sony.",
  themeDark: "Dunkles Erscheinungsbild",
  themeLight: "Helles Erscheinungsbild",
  language: "Sprache",
  footerNav: "Seitenfuß",
  toolsHeading: "Weitere Werkzeuge",
  merkliste: "Zur Merkliste",
  storageNote: "Das Overlay selbst speichert nichts. Diese Einstellungsseite merkt sich die letzte Konfiguration im localStorage unter consolecheat-overlay-v1.",
  controlsHeading: "Tastatur-Demo",
  controls:
    "Zum Testen ohne Controller: Pfeiltasten = Steuerkreuz, WASD = linker Stick, IJKL = rechter Stick, Z/X/C/V = Aktionstasten 1–4, Q/E = L1/R1, 1/3 = L2/R2, F/H = L3/R3, N = Share, M = Options, P = PS/Home, T = Touchpad. Die Demo ist abschaltbar und greift nicht, solange ein Formularfeld den Fokus hat. Im Overlay ist sie nur mit demo=1 im Link aktiv.",
  previewHeading: "Vorschau",
  previewNote: "Das Karomuster zeigt die transparenten Stellen. In OBS sieht man dort das Spiel.",
  overlayLabel: "Controller-Anzeige",
  hintPress: "Drücke eine Taste am Controller",
  hintWhy: "Browser geben einen Controller erst nach einem Tastendruck frei.",
  padConnected: "Verbunden: {id}",
  demoPreview: "Tastatur-Demo in der Vorschau",
  settingsHeading: "Einstellungen",
  skinLabel: "Skin",
  accentLabel: "Akzentfarbe",
  baseLabel: "Grundfarbe",
  pressedLabel: "Farbe beim Drücken",
  scaleLabel: "Größe (Faktor)",
  opacityLabel: "Deckkraft",
  deadzoneLabel: "Deadzone der Sticks",
  padLabel: "Controller",
  padAuto: "Automatisch (erster verbundener)",
  padSlot: "Controller {n}",
  sticksLabel: "Sticks zeigen",
  triggersLabel: "Trigger (L2/R2) zeigen",
  hintLabel: "Hinweis zeigen, solange kein Controller erkannt ist",
  demoLabel: "Tastatur-Demo im Overlay (demo=1)",
  urlHeading: "Overlay-Link",
  urlLabel: "Link für die Browserquelle",
  copy: "Link kopieren",
  copied: "Link kopiert.",
  copyFailed: "Kopieren ging nicht. Der Link ist im Feld markiert, kopiere ihn mit Strg+C.",
  open: "Overlay öffnen",
  reset: "Standardwerte",
  obsHeading: "So kommt das Overlay in OBS",
  obs1: "In OBS unter Quellen auf + klicken und „Browser“ wählen.",
  obs2: "Den Overlay-Link als URL einfügen.",
  obs3: "Breite {w} und Höhe {h} eintragen (passend zur gewählten Größe).",
  obs4: "Benutzerdefiniertes CSS ist nicht nötig. Der Hintergrund ist schon transparent.",
  obs5: "Einmal eine Taste am Controller drücken, solange OBS läuft. Erst dann gibt der Browser den Controller frei.",
  configCorrupt: "Die gespeicherte Konfiguration war unlesbar. Es gelten die Standardwerte.",
  saveFailed: "Die Konfiguration konnte nicht gespeichert werden. Der Link funktioniert trotzdem.",
  deleteAll: "Gespeicherte Konfiguration löschen",
  deleteAsk:
    "Wirklich die gespeicherte Konfiguration in diesem Browser löschen? Nur der Schlüssel consolecheat-overlay-v1. Sprache und Erscheinungsbild bleiben, Overlay-Links funktionieren weiter.",
  deleteYes: "Nur die Konfiguration löschen",
  deleteNo: "Abbrechen",
  deleted: "Die gespeicherte Konfiguration ist aus diesem Browser gelöscht.",
  deleteFailed: "Die Konfiguration konnte nicht gelöscht werden.",
};

export type Copy = typeof de;

const en: Copy = {
  brand: "consolecheat",
  title: "Input overlay for streams",
  metaDescription:
    "Input overlay for streams: shows your controller's buttons, triggers, and sticks live as a transparent overlay for OBS. Configured only through the URL, no sign-in. Unofficial, not from Sony.",
  eyebrow: "Tool · Streaming",
  lede: "Show your viewers what you press: buttons, triggers, and both sticks live through the Gamepad API. Pick skin, colours, and size here and add the link to OBS as a browser source. The overlay has a fully transparent background.",
  freeClaim: "Completely free. This page does not charge anything.",
  privacyClaim: "No sensitive data is stored. Controller input is only shown in the browser and sent nowhere.",
  unofficial: "Unofficial. Not from Sony.",
  footerNote: "The settings live in the link. This page is not Sony.",
  themeDark: "Dark appearance",
  themeLight: "Light appearance",
  language: "Language",
  footerNav: "Footer",
  toolsHeading: "Other tools",
  merkliste: "Back to the backlog",
  storageNote: "The overlay itself stores nothing. This settings page remembers the last configuration in the localStorage key consolecheat-overlay-v1.",
  controlsHeading: "Keyboard demo",
  controls:
    "To test without a controller: arrow keys = D-pad, WASD = left stick, IJKL = right stick, Z/X/C/V = face buttons 1–4, Q/E = L1/R1, 1/3 = L2/R2, F/H = L3/R3, N = Share, M = Options, P = PS/Home, T = touchpad. The demo can be switched off and does nothing while a form field has focus. In the overlay it is only active with demo=1 in the link.",
  previewHeading: "Preview",
  previewNote: "The checkerboard marks the transparent parts. In OBS the game shows through there.",
  overlayLabel: "Controller display",
  hintPress: "Press a button on the controller",
  hintWhy: "Browsers only expose a controller after a button press.",
  padConnected: "Connected: {id}",
  demoPreview: "Keyboard demo in the preview",
  settingsHeading: "Settings",
  skinLabel: "Skin",
  accentLabel: "Accent colour",
  baseLabel: "Base colour",
  pressedLabel: "Pressed colour",
  scaleLabel: "Size (factor)",
  opacityLabel: "Opacity",
  deadzoneLabel: "Stick deadzone",
  padLabel: "Controller",
  padAuto: "Automatic (first connected)",
  padSlot: "Controller {n}",
  sticksLabel: "Show sticks",
  triggersLabel: "Show triggers (L2/R2)",
  hintLabel: "Show a hint while no controller is detected",
  demoLabel: "Keyboard demo in the overlay (demo=1)",
  urlHeading: "Overlay link",
  urlLabel: "Link for the browser source",
  copy: "Copy link",
  copied: "Link copied.",
  copyFailed: "Copying did not work. The link is selected in the field; copy it with Ctrl+C.",
  open: "Open overlay",
  reset: "Defaults",
  obsHeading: "Adding the overlay to OBS",
  obs1: "In OBS, click + under Sources and choose “Browser”.",
  obs2: "Paste the overlay link as the URL.",
  obs3: "Enter width {w} and height {h} (matching the chosen size).",
  obs4: "No custom CSS is needed. The background is already transparent.",
  obs5: "Press a button on the controller once while OBS is running. Only then does the browser expose the controller.",
  configCorrupt: "The saved configuration could not be read. The defaults apply.",
  saveFailed: "The configuration could not be saved. The link still works.",
  deleteAll: "Delete saved configuration",
  deleteAsk:
    "Really delete the saved configuration in this browser? Only the key consolecheat-overlay-v1. Language and appearance stay, and overlay links keep working.",
  deleteYes: "Delete only the configuration",
  deleteNo: "Cancel",
  deleted: "The saved configuration is deleted from this browser.",
  deleteFailed: "The configuration could not be deleted.",
};

export const copy: Record<Lang, Copy> = { de, en };

const ids = new Set<string>(languageOptions.map((item) => item.id));

export function isLang(value: string | null): value is Lang {
  return value !== null && ids.has(value);
}

export function initialLang(stored: string | null): Lang {
  return isLang(stored) ? stored : "de";
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{([A-Za-z0-9]+)\}/g, (all, key: string) => {
    const value = values[key];
    return value === undefined ? all : String(value);
  });
}
