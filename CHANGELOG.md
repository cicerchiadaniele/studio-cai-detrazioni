# Changelog

Tutte le modifiche importanti al progetto saranno documentate in questo file.

## [2.0] - 2026-09-23

Nuova grafica nello stile di Studio CAI. **Nessuna modifica lato dati**: stessi campi, stesse validazioni, stessi nomi nel payload, stesso webhook Make.com e stesso formato JSON, stesso ordine dei passaggi, ricarica della pagina 3 secondi dopo l'invio riuscito.

### Modificato
- Colori: il viola/indaco/blu lascia il posto al bordeaux Studio CAI (#8B1538); rosso solo per gli errori, ambra per gli avvisi
- Font Fraunces (titoli) e Manrope (testo), sfondo "carta" con texture leggera
- Header fisso con logo (`public/logo.jpg`), "Studio CAI", badge versione e sottotitolo "Modulo detrazioni fiscali"; pannello informativo apribile dall'icona "i"
- Introduzione in alto e card del modulo con testata bordeaux; sezioni numerate Step 1-5 (condominio, immobile, proprietario, dichiarazioni, recapiti)
- Caselle delle dichiarazioni ridisegnate; la conferma "Requisiti soddisfatti per l'aliquota del 50%" ora è bordeaux (prima verde)
- Schermata di esito "Modulo inviato" dentro la card, in bordeaux
- Errore d'invio mostrato come messaggio nella pagina sopra il pulsante (prima era una finestra `alert()`)
- Testi dell'interfaccia con la sola iniziale maiuscola, senza emoji (es. "Invia il modulo", "Dati catastali", "Scadenza imminente: 31 dicembre")
- Opzione "Posto auto" scritta con la minuscola nel menu; il valore inviato resta "Posto Auto"
- Footer comune: © Studio CAI, versione e data di ultimo aggiornamento
- Campo data di nascita con classe `campo-data` e regole iOS/iPadOS (campi a 16px, data allineata a sinistra) in `src/index.css`
- `tailwind.config.js` con colori `brand` e font di casa; `public/index.html` con titolo "Modulo detrazioni fiscali – Studio CAI", font Google e icona dal logo

## [1.0.1] - 2026-09-23

### Modificato
- Campo data di nascita su iPhone e iPad allineato a sinistra e alto come gli altri campi (solo `src/index.css`)

## [1.0.0] - 2025-02-11

### Aggiunto

#### Funzionalità Core
- Modulo completo su pagina singola per raccolta dati detrazioni fiscali
- Sistema di validazione in tempo reale per tutti i campi
- Validazione codice fiscale italiano con controllo formato
- Validazione email con controllo formato
- Validazione numero di telefono
- Gestione automatica delle aliquote (50% o 36%) basata sulle dichiarazioni
- **Invio dati configurato al webhook Make.com** (https://hook.eu1.make.com/hp2vnjhmqpmvb7ju9abtp5f3vg8go3a1)

#### Sezioni del Modulo
- **Dati Condominio**: Nome condominio e civico
- **Dati Immobile**: Tipo immobile, interno e dati catastali completi
- **Dati Proprietario**: Anagrafica completa con codice fiscale e quota possesso
- **Dichiarazioni**: Abitazione principale e richiesta detrazione 50%
- **Recapiti**: Email e telefono obbligatori

#### Avvisi e Notifiche
- Alert automatico scadenza 31 dicembre (attivo dal 15 dicembre)
- Avviso normativa aliquote differenziate in header
- Warning dinamico se si richiede 50% senza abitazione principale
- Conferma verde quando requisiti 50% sono soddisfatti
- Info box su possibilità di rettifica dichiarazione precompilata

#### UI/UX
- Design moderno con gradiente viola/indaco
- Interfaccia responsive per mobile, tablet e desktop
- Animazioni fluide con Framer Motion
- Icone Lucide React
- Box informativi colorati (giallo=warning, blu=info, verde=success)
- Feedback visivo immediato su errori di validazione
- Loading state durante invio
- Schermata di successo dopo invio

#### Validazioni
- Campi obbligatori: condominio, dati catastali (foglio, particella, subalterno, categoria), cognome, nome, codice fiscale, email, telefono
- Controllo formato codice fiscale (16 caratteri alfanumerici)
- Controllo formato email (RFC compliant)
- Controllo formato telefono (min 8 caratteri)
- Controllo quota possesso (0-100)
- Controllo coerenza dichiarazioni (50% richiede abitazione principale)

#### Tecnologie
- React 18.3.1
- Tailwind CSS 3.4.0
- Framer Motion 11.0.0
- Lucide React 0.453.0
- React Scripts 5.0.1

#### Documentazione
- README.md completo con istruzioni installazione e configurazione
- GUIDA_UTENTE.md dettagliata per compilazione modulo
- CHANGELOG.md per tracciamento versioni
- Commenti nel codice per facilitare manutenzione

### Caratteristiche Principali

- **Conformità Normativa**: Implementazione completa delle regole per aliquote differenziate
- **User-Friendly**: Interfaccia intuitiva con feedback immediato
- **Validazione Robusta**: Controlli multipli per garantire dati corretti
- **Responsive**: Funziona perfettamente su tutti i dispositivi
- **Accessibile**: Design pensato per facilità d'uso

### Note

- **Webhook Make.com già configurato e funzionante**
- Formato dati JSON strutturato e standardizzato
- Autocertificazione conforme al DPR 445/2000
- Data e timestamp automatici per ogni invio
- Gestione errori HTTP con feedback utente

### Sviluppi Futuri Pianificati

- [ ] Salvataggio automatico bozza in localStorage
- [ ] Possibilità di salvare modulo come PDF
- [ ] Multi-lingua (IT/EN)
- [ ] Firma digitale integrata
- [ ] Dashboard amministratore per gestione invii
- [ ] Esportazione dati in formato Excel/CSV
- [ ] Notifiche email automatiche
- [ ] Sistema di promemoria pre-scadenza

---

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/lang/it/).
