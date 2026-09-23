import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  Info,
  AlertTriangle,
  Home,
  User,
  Mail,
  Phone,
  FileText,
  Shield,
  ShieldCheck,
  Sparkles,
  Percent,
  ChevronDown,
  Loader2,
  MapPin,
  X,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Build constants (v2.0)
// ─────────────────────────────────────────────────────────────
const APP_VERSION = "2.0";
const BUILD_DATE_LABEL = "23/09/2026";
const BRAND = "Studio CAI";
const LOGO_URL = "/logo.jpg";

const TIPI_IMMOBILE = [
  { value: "Appartamento", label: "Appartamento" },
  { value: "Box", label: "Box" },
  { value: "Cantina", label: "Cantina" },
  { value: "Garage", label: "Garage" },
  { value: "Posto Auto", label: "Posto auto" }, // il valore inviato resta "Posto Auto"
];

// Helpers
const cn = (...cls) => cls.filter(Boolean).join(" ");

// Validazione Codice Fiscale italiano
const validateCF = (cf) => {
  if (!cf) return false;
  const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;
  return cfRegex.test(cf.toUpperCase());
};

// Validazione Email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validazione Telefono
const validatePhone = (phone) => {
  const phoneRegex = /^[0-9\s\-\+\(\)]{8,}$/; // eslint-disable-line no-useless-escape
  return phoneRegex.test(phone);
};

export default function ModuloDetrazioniFiscali() {
  const [formData, setFormData] = useState({
    condominio: '',
    civico: '',
    tipoImmobile: '',
    interno: '',
    sezione: '',
    foglio: '',
    particella: '',
    subalterno: '',
    categoria: '',
    cognome: '',
    nome: '',
    dataNascita: '',
    luogoNascita: '',
    codiceFiscale: '',
    quotaPossesso: '',
    abitazionePrincipale: false,
    detrazione50: false,
    email: '',
    telefono: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  // v2.0: messaggio di errore d'invio mostrato nella pagina (prima era un alert())
  const [erroreInvio, setErroreInvio] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  // v2.0: la conferma compare in cima alla pagina
  useEffect(() => {
    if (submitSuccess) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [submitSuccess]);

  // Controlla se è l'ultima settimana dell'anno
  const isEndOfYear = () => {
    const today = new Date();
    const month = today.getMonth();
    const day = today.getDate();
    return month === 11 && day >= 15; // Dicembre dal 15 in poi
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const validateField = (field, value) => {
    let error = '';

    switch(field) { // eslint-disable-line default-case
      case 'condominio':
        if (!value.trim()) error = 'Campo obbligatorio';
        break;
      case 'foglio':
      case 'particella':
      case 'subalterno':
        if (!value.trim()) error = 'Dato catastale obbligatorio';
        break;
      case 'categoria':
        if (!value.trim()) error = 'Categoria catastale obbligatoria';
        break;
      case 'cognome':
      case 'nome':
        if (!value.trim()) error = 'Campo obbligatorio';
        break;
      case 'codiceFiscale':
        if (!value.trim()) {
          error = 'Codice fiscale obbligatorio';
        } else if (!validateCF(value)) {
          error = 'Codice fiscale non valido';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email obbligatoria';
        } else if (!validateEmail(value)) {
          error = 'Email non valida';
        }
        break;
      case 'telefono':
        if (!value.trim()) {
          error = 'Telefono obbligatorio';
        } else if (!validatePhone(value)) {
          error = 'Numero di telefono non valido';
        }
        break;
      case 'quotaPossesso':
        if (value && (isNaN(value) || value <= 0 || value > 100)) {
          error = 'La quota deve essere tra 1 e 100';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  const validateForm = () => {
    const requiredFields = [
      'condominio', 'foglio', 'particella', 'subalterno', 'categoria',
      'cognome', 'nome', 'codiceFiscale', 'email', 'telefono'
    ];

    let isValid = true;
    requiredFields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    if (formData.detrazione50 && !formData.abitazionePrincipale) {
      setErrors(prev => ({
        ...prev,
        abitazionePrincipale: 'Per richiedere la detrazione al 50% è necessario che l\'immobile sia abitazione principale'
      }));
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroreInvio("");

    const allFields = Object.keys(formData);
    const allTouched = {};
    allFields.forEach(field => allTouched[field] = true);
    setTouched(allTouched);

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSend = {
        ...formData,
        dataInvio: new Date().toISOString(),
        aliquotaApplicabile: formData.detrazione50 && formData.abitazionePrincipale ? '50%' : '36%',
        timestamp: new Date().toLocaleString('it-IT')
      };

      console.log('Dati da inviare:', dataToSend);

      // Invio dati al webhook Make.com
      const response = await fetch('https://hook.eu1.make.com/hp2vnjhmqpmvb7ju9abtp5f3vg8go3a1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }

      console.log('Dati inviati con successo');

      setSubmitSuccess(true);

      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error('Errore invio:', error);
      setErroreInvio("Errore durante l'invio del modulo. Riprova.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const err = (field) => (touched[field] && errors[field]) || null;

  return (
    <div className="relative min-h-screen w-full bg-paper bg-noise text-neutral-900">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-brand/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-neutral-200/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-white ring-1 ring-neutral-200 shadow-soft flex items-center justify-center">
                <img src={LOGO_URL} alt="logo" className="w-full h-full object-contain p-1"
                  onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand ring-2 ring-white flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" strokeWidth={3} />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-semibold text-xl sm:text-2xl text-neutral-900 truncate">{BRAND}</h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900 text-white tracking-wider">v{APP_VERSION}</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">Modulo detrazioni fiscali</p>
            </div>
            <button type="button" onClick={() => setShowInfo(!showInfo)} className="p-2.5 rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors" aria-label="Informazioni">
              <Info className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="relative z-10 bg-gradient-to-b from-brand/8 to-brand/4 border-b border-brand/20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-start gap-3 text-sm">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-brand/12 flex items-center justify-center"><Info className="w-5 h-5 text-brand-dark" /></div>
              <div className="flex-1 text-neutral-600">
                <p className="font-semibold text-brand-deep mb-1">Come funziona</p>
                Compila i dati dell'unità immobiliare e del proprietario, indica le dichiarazioni e invia il modulo
                entro il 31 dicembre. Riceverai una copia dell'autocertificazione all'indirizzo email indicato.
              </div>
              <button type="button" onClick={() => setShowInfo(false)} className="p-1.5 hover:bg-brand/12 rounded-lg"><X className="w-4 h-4 text-brand-dark" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      {!submitSuccess && (
        <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur ring-1 ring-neutral-200 text-xs font-medium text-neutral-700 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-brand" /> Da inviare entro il 31 dicembre
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold text-neutral-900 leading-[1.05] tracking-tight">
              Detrazioni per la tua <em className="not-italic text-brand">abitazione principale</em>
            </h2>
            <p className="mt-4 text-neutral-600 text-base sm:text-lg">
              Aliquote differenziate: comunica all'amministrazione i dati dell'immobile e se ti spetta l'aliquota maggiorata del 50%.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-600">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white ring-1 ring-neutral-200"><Percent className="w-3 h-3" /> Aliquota 50% o 36%</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white ring-1 ring-neutral-200"><ShieldCheck className="w-3 h-3" /> Autocertificazione DPR 445/2000</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white ring-1 ring-neutral-200"><Mail className="w-3 h-3" /> Copia via email</span>
            </div>
          </motion.div>
        </section>
      )}

      <main className={cn("relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8", submitSuccess && "pt-8 sm:pt-12")}>
        <motion.div layout className="bg-white rounded-3xl shadow-lift overflow-hidden ring-1 ring-neutral-200/80"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="relative overflow-hidden bg-gradient-to-br from-brand via-brand-dark to-brand-deep px-6 sm:px-8 py-6">
            <div aria-hidden="true" className="absolute inset-0 opacity-20" style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
              backgroundSize: "32px 32px", backgroundPosition: "0 0, 16px 16px" }} />
            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25 flex items-center justify-center">
                {submitSuccess ? <CheckCircle2 className="w-5 h-5 text-white" /> : <FileText className="w-5 h-5 text-white" />}
              </div>
              <div className="flex-1">
                <h2 className="font-display font-semibold text-xl sm:text-2xl text-white leading-tight">
                  {submitSuccess ? "Modulo inviato" : "Comunicazione detrazioni fiscali"}
                </h2>
                <p className="text-white/85 text-sm mt-1">
                  {submitSuccess ? "Autocertificazione registrata" : <>Tutti i campi con <span className="font-semibold">*</span> sono obbligatori</>}
                </p>
              </div>
            </div>
          </div>

          {/* ═══ ESITO ═══ */}
          {submitSuccess && (
            <div className="p-6 sm:p-8">
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border p-5 shadow-soft bg-gradient-to-br from-brand/8 to-white border-brand/30">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-brand/12 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-brand-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-brand-deep text-lg leading-tight">Modulo inviato con successo</div>
                    <p className="text-sm text-neutral-600 mt-1">
                      Riceverai una copia dell'autocertificazione all'indirizzo email indicato.
                    </p>
                    <p className="text-sm text-neutral-600 mt-3">
                      La tua richiesta è stata registrata correttamente. L'amministrazione procederà con l'inserimento dei dati nella comunicazione all'Agenzia delle Entrate.
                    </p>
                  </div>
                </div>
              </motion.div>
              <p className="mt-4 text-center text-xs text-neutral-500 flex items-center justify-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Tra pochi secondi la pagina torna al modulo vuoto
              </p>
            </div>
          )}

          {/* ═══ MODULO ═══ */}
          {!submitSuccess && (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
              {/* Avviso scadenza */}
              <AnimatePresence>
                {isEndOfYear() && (
                  <Nota tipo="avviso" titolo="Scadenza imminente: 31 dicembre">
                    La comunicazione deve essere presentata entro il 31 dicembre per beneficiare dell'aliquota maggiorata del 50% nelle future dichiarazioni.
                  </Nota>
                )}
              </AnimatePresence>

              {/* Informazioni importanti */}
              <div className="rounded-2xl bg-brand/5 ring-1 ring-brand/15 p-4 sm:p-5">
                <p className="font-display font-semibold text-brand-deep flex items-center gap-2 mb-2.5">
                  <Info className="w-4 h-4 text-brand" /> Informazioni importanti
                </p>
                <ul className="text-sm text-neutral-700 space-y-2 leading-relaxed">
                  <li><b className="text-neutral-900">Aliquota 50%:</b> applicabile se l'intervento è sostenuto dal proprietario o titolare di diritto reale e l'unità immobiliare è destinata ad abitazione principale.</li>
                  <li><b className="text-neutral-900">Aliquota 36%:</b> applicabile in tutti gli altri casi.</li>
                  <li><b className="text-neutral-900">Scadenza:</b> entro il 31 dicembre di ogni anno.</li>
                  <li><b className="text-neutral-900">Effetti della mancata comunicazione:</b> senza comunicazione entro il 31 dicembre, non sarà applicata l'aliquota maggiorata del 50% nella dichiarazione precompilata.</li>
                </ul>
              </div>

              <FormSection step={1} icon={<Building2 className="w-4 h-4" />} title="Dati del condominio" description="Lo stabile in cui si trova l'unità immobiliare">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-3">
                    <TextField label="Condominio" required placeholder="Es. Via Roma, Condominio Rossi" value={formData.condominio}
                      onChange={(v) => handleChange('condominio', v)} icon={<MapPin className="w-4 h-4" />} error={err('condominio')} />
                  </div>
                  <TextField label="Civico" placeholder="N." value={formData.civico}
                    onChange={(v) => handleChange('civico', v)} />
                </div>
              </FormSection>

              <FormSection step={2} icon={<Home className="w-4 h-4" />} title="Dati dell'immobile" description="Tipo di unità e dati catastali">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField label="Tipo di immobile" value={formData.tipoImmobile} options={TIPI_IMMOBILE}
                    onChange={(v) => handleChange('tipoImmobile', v)} />
                  <TextField label="Interno" placeholder="Es. 5, A, 12/B" value={formData.interno}
                    onChange={(v) => handleChange('interno', v)} />
                </div>

                <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
                  <p className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand" /> Dati catastali
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 mb-3">Obbligatori, tranne la sezione. Li trovi nella visura catastale o nell'atto di acquisto.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <TextField label="Sezione" value={formData.sezione}
                      onChange={(v) => handleChange('sezione', v)} />
                    <TextField label="Foglio" required value={formData.foglio}
                      onChange={(v) => handleChange('foglio', v)} error={err('foglio')} />
                    <TextField label="Particella" required value={formData.particella}
                      onChange={(v) => handleChange('particella', v)} error={err('particella')} />
                    <TextField label="Subalterno" required value={formData.subalterno}
                      onChange={(v) => handleChange('subalterno', v)} error={err('subalterno')} />
                    <TextField label="Categoria" required placeholder="A/2" value={formData.categoria}
                      onChange={(v) => handleChange('categoria', v.toUpperCase())} error={err('categoria')} />
                  </div>
                </div>
              </FormSection>

              <FormSection step={3} icon={<User className="w-4 h-4" />} title="Dati del proprietario" description="Chi sostiene la spesa e dichiara">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField label="Cognome" required placeholder="Rossi" value={formData.cognome}
                    onChange={(v) => handleChange('cognome', v)} error={err('cognome')} />
                  <TextField label="Nome" required placeholder="Mario" value={formData.nome}
                    onChange={(v) => handleChange('nome', v)} error={err('nome')} />
                  <TextField label="Data di nascita" type="date" value={formData.dataNascita}
                    onChange={(v) => handleChange('dataNascita', v)} />
                  <TextField label="Luogo di nascita" placeholder="Comune (provincia)" value={formData.luogoNascita}
                    onChange={(v) => handleChange('luogoNascita', v)} />
                  <TextField label="Codice fiscale" required placeholder="RSSMRA80A01H501U" mono maxLength="16" value={formData.codiceFiscale}
                    onChange={(v) => handleChange('codiceFiscale', v.toUpperCase())} error={err('codiceFiscale')} />
                  <TextField label="Quota di possesso (%)" type="number" min="0" max="100" placeholder="Es. 100, 50, 33.33" value={formData.quotaPossesso}
                    onChange={(v) => handleChange('quotaPossesso', v)} error={err('quotaPossesso')} hint="Se sei l'unico proprietario indica 100" />
                </div>
              </FormSection>

              <FormSection step={4} icon={<ShieldCheck className="w-4 h-4" />} title="Dichiarazioni" description="Determinano l'aliquota applicabile">
                <div className="space-y-3">
                  <Spunta checked={formData.abitazionePrincipale} onChange={(v) => handleChange('abitazionePrincipale', v)}
                    titolo="Destinazione d'uso dell'immobile">
                    L'unità immobiliare sopra indicata costituisce la propria abitazione principale (residenza anagrafica e dimora abituale).
                  </Spunta>
                  <Spunta checked={formData.detrazione50} onChange={(v) => handleChange('detrazione50', v)}
                    titolo="Diritto alla detrazione">
                    Intendo usufruire della detrazione fiscale del 50%.
                  </Spunta>

                  <AnimatePresence>
                    {formData.detrazione50 && !formData.abitazionePrincipale && (
                      <Nota key="avviso50" tipo="avviso" titolo="Attenzione">
                        Per richiedere la detrazione al 50% è necessario che l'immobile sia adibito ad abitazione principale. Seleziona anche la prima opzione.
                      </Nota>
                    )}
                    {formData.abitazionePrincipale && formData.detrazione50 && (
                      <Nota key="ok50" tipo="conferma" titolo="Requisiti soddisfatti per l'aliquota del 50%">
                        Hai i requisiti per beneficiare dell'aliquota maggiorata del 50%. L'amministrazione inserirà questa informazione nella comunicazione all'Agenzia delle Entrate.
                      </Nota>
                    )}
                  </AnimatePresence>
                </div>
              </FormSection>

              <FormSection step={5} icon={<Mail className="w-4 h-4" />} title="Recapiti" description="Obbligatori: riceverai una copia dell'autocertificazione all'indirizzo email indicato">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField label="Email" required type="email" placeholder="esempio@email.com" value={formData.email}
                    onChange={(v) => handleChange('email', v)} icon={<Mail className="w-4 h-4" />} error={err('email')} />
                  <TextField label="Telefono" required type="tel" placeholder="+39 333 1234567" value={formData.telefono}
                    onChange={(v) => handleChange('telefono', v)} icon={<Phone className="w-4 h-4" />} error={err('telefono')} />
                </div>
              </FormSection>

              <Nota tipo="info" titolo="Possibilità di rettifica">
                Si precisa che il contribuente potrà comunque modificare e integrare la propria dichiarazione dei redditi precompilata. Si consiglia sempre di verificare con il proprio commercialista la corretta compilazione della dichiarazione precompilata ed eventualmente correggerla.
              </Nota>

              <div className="border-t border-neutral-200 pt-6 space-y-4">
                <p className="text-[13.5px] leading-relaxed text-neutral-700 rounded-2xl bg-neutral-50 ring-1 ring-neutral-200 px-4 py-3">
                  Inviando questo modulo, dichiari che le informazioni fornite sono veritiere e costituiscono un'autocertificazione ai sensi del DPR 445/2000. Riceverai una copia all'indirizzo email indicato.
                </p>

                <AnimatePresence>
                  {erroreInvio && <Nota tipo="errore" onClose={() => setErroreInvio("")}>{erroreInvio}</Nota>}
                </AnimatePresence>

                <Bottone type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isSubmitting ? "Invio in corso…" : "Invia il modulo"}
                </Bottone>

                <p className="text-xs text-neutral-500 text-center">
                  Data invio: {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </main>

      <footer className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white/70 backdrop-blur rounded-2xl ring-1 ring-neutral-200 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 text-neutral-600 text-center sm:text-left">
              <Building2 className="w-4 h-4 text-brand" />
              <span>© {new Date().getFullYear()} <span className="font-semibold text-neutral-800">{BRAND}</span> — Tutti i diritti riservati</span>
            </div>
            <div className="text-center sm:text-right text-xs text-neutral-500 tabular-nums">
              <span className="font-mono font-semibold text-neutral-700">v{APP_VERSION}</span>
              <span className="mx-2">·</span>
              Ultimo aggiornamento: <span className="font-semibold text-neutral-700">{BUILD_DATE_LABEL}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────
function FormSection({ step, icon, title, description, children }) {
  return (
    <section>
      <header className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center ring-1 ring-brand/20">{icon}</div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Step {step}</span>
          <h3 className="font-display font-semibold text-lg text-neutral-900 leading-tight">{title}</h3>
          {description && <p className="text-sm text-neutral-600 mt-0.5">{description}</p>}
        </div>
      </header>
      <div className="pl-0 sm:pl-12">{children}</div>
    </section>
  );
}

function Messaggio({ error, hint }) {
  if (error) return <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3 flex-shrink-0" />{error}</motion.p>;
  if (hint) return <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>;
  return null;
}

function TextField({ label, value, onChange, placeholder, type = "text", icon, required, error, hint, mono, min, max, maxLength }) {
  return (
    <div className="min-w-0">
      <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5 mb-1.5">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">{icon}</span>}
        <input type={type} value={value} min={min} max={max} maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={cn(
            "w-full rounded-2xl border py-3 text-sm focus:outline-none focus:ring-2 transition-all bg-white placeholder:text-neutral-400",
            icon ? "pl-10 pr-4" : "px-4", mono && "font-mono uppercase tracking-wider",
            type === "date" && "campo-data",
            error ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
              : "border-neutral-300 hover:border-neutral-400 focus:ring-brand/20 focus:border-brand"
          )} />
      </div>
      <Messaggio error={error} hint={hint} />
    </div>
  );
}

function SelectField({ label, value, onChange, options = [], required, error }) {
  return (
    <div className="min-w-0">
      <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5 mb-1.5">{label}{required && <span className="text-red-500">*</span>}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className={cn("appearance-none w-full rounded-2xl border px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 bg-white transition-all",
            !value && "text-neutral-500",
            error ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : "border-neutral-300 hover:border-neutral-400 focus:ring-brand/20 focus:border-brand")}>
          <option value="">— Seleziona —</option>
          {options.map((o) => <option key={o.value} value={o.value} className="text-neutral-900">{o.label}</option>)}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
      </div>
      <Messaggio error={error} />
    </div>
  );
}

function Spunta({ checked, onChange, titolo, children }) {
  return (
    <label className={cn("flex gap-3 items-start p-4 rounded-2xl border cursor-pointer transition-all text-[13.5px] leading-relaxed text-neutral-700",
      checked ? "border-brand bg-brand/5" : "border-neutral-200 hover:border-neutral-300")}>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={cn("mt-0.5 w-[22px] h-[22px] rounded-[7px] border-2 flex-shrink-0 flex items-center justify-center transition-all",
        checked ? "bg-brand border-brand" : "bg-white border-neutral-300")}>
        {checked && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><path d="m5 12 5 5 9-10" /></svg>}
      </span>
      <span>
        {titolo && <span className="block font-semibold text-neutral-900 mb-0.5">{titolo}</span>}
        {children}
      </span>
    </label>
  );
}

function Nota({ tipo, titolo, children, onClose }) {
  const stili = {
    errore: "bg-red-50 border-red-300 text-red-900",
    avviso: "bg-amber-50 border-amber-300 text-amber-900",
    info: "bg-brand/5 border-brand/20 text-neutral-700",
    conferma: "bg-gradient-to-br from-brand/8 to-white border-brand/30 text-neutral-700",
  };
  const icone = { errore: AlertCircle, avviso: AlertTriangle, info: Info, conferma: CheckCircle2 };
  const Icona = icone[tipo] || Info;
  const coloreIcona = tipo === "info" ? "text-brand" : tipo === "conferma" ? "text-brand-dark" : "";
  const coloreTitolo = tipo === "info" || tipo === "conferma" ? "text-brand-deep" : "";
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className={cn("flex gap-2.5 items-start rounded-2xl border px-4 py-3 text-sm leading-relaxed", stili[tipo])}>
      <Icona className={cn("w-4 h-4 mt-0.5 flex-shrink-0", coloreIcona)} />
      <div className="flex-1">
        {titolo && <p className={cn("font-semibold mb-0.5", coloreTitolo)}>{titolo}</p>}
        {children}
      </div>
      {onClose && <button type="button" onClick={onClose} className="p-0.5 opacity-70 hover:opacity-100" aria-label="Chiudi"><X className="w-4 h-4" /></button>}
    </motion.div>
  );
}

function Bottone({ children, onClick, disabled, variante, type = "button" }) {
  return (
    <motion.button type={type} onClick={onClick} disabled={disabled}
      whileHover={disabled ? {} : { y: -1 }} whileTap={disabled ? {} : { scale: 0.99 }}
      className={cn("w-full rounded-2xl py-4 px-5 text-[15px] font-bold flex items-center justify-center gap-2.5 transition-all disabled:opacity-55 disabled:cursor-not-allowed",
        variante === "ghost"
          ? "bg-white text-brand ring-1 ring-brand/30 hover:bg-brand/5"
          : "text-white bg-gradient-to-br from-brand to-brand-dark shadow-[0_10px_24px_-10px_rgba(139,21,56,0.6)]")}>
      {children}
    </motion.button>
  );
}
