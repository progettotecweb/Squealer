# TODO Squealer

-   Arancione: non obbligatorie, migliore valutazione
-   verde: obbligatorie
-   nere (qui bianche): obbligatorie

<style>
    .green {
        color: green;
    }

    .orange {
        color: orange;
    }

    </style>

## GENERALE

-   [x] Numero massimo di caratteri, controllo prima di postare,
-   [x] meccanismo per resettare giornalmente / settimanalmente / mensilmente i counter
-   [x] Destinatari (singolo utente, canale, tutti (pubblico))
-   [x] Squeal contiene testo, immagine (125 caratteri), geolocazione (125 caratteri)
-   [x] <span class="green">quota parametrica da essere modificata velocemente</span>
-   [ ] <span class="orange">possibilità da parte dell'utente che finisce i caratteri mentre digita di usare un certo numero di chars extra da pagare in seguito</span>
-   [ ] messaggi a privati (utenti) non consumano quota e sono sempre disponibili
-   [ ] l'utente può comprare chars extra oppure ottenendo apprezzamenti dal pubblico. Reazioni negative diminuiscono la quota
-   [x] Destinatari dei messaggi: @ per gli utenti, §canale per i canali di proprietà degli utenti, §CANALE per i canali di proprietà di squealer, # per le keywords
-   [x] Canali ufficiali obbligatori: §CONTROVERSIAL, §TRENDING, §NEWS, §TOP_1000, etc.
-   [ ] <span class="orange">alcuni canali non sono mai silenziabili</span>
-   [x] Impressioni; numero di utenti, registrati o meno che hanno visualizzato uno squeal.
-   [x] Reazioni agli squeal: ne abbiamo 4
-   [x] Massa critica: 0.25* numero di visualizzazioni. Se le reazioni positive sono maggiori della massa critica, lo squeal viene etichettato come "popolare"; se le reazioni negative sono maggiori della massa critica, lo squeal viene etichettato come "impopolare"; se sia le reazioni positive che quelle negative superano la massa critica, lo squeal viene etichettato come "controverso".
-   [x] Ogni tot messaggi popolari l'utente vede incrementata la sua quota; ogni tot messaggi impopolari l'utente vede decrementata la sua quota (ogni 3, ogni 5, da decidere). Gli squeal controversi non influenzano la quota ma appaiono nel canale §CONTROVERSIAL.
-   [x] Metadati di uno squeal: 
    -   corpo del messaggio (testo | immagine | video | geolocazione),
    -   destinatari (individui | canali | keywords),
    -   data e ora di creazione,
    -   reazioni positive
    -   reazioni negative
    -   categoria (popolare | impopolare | controverso | messaggio privato | messaggio pubblico)
    -   numero di visualizzazioni
    -   canali a cui appartiene
-  [ ] Messaggi automatici e da sorgenti esterne
   -  [x] messaggi temporizzati (qua ci sta da lavora se vogliamo una cosa fatta per bene)
   -  [ ] <span class="orange">News lette da APi pubbliche</span>
   -  [ ] <span class="orange">Immagini casuali tipo da unsplash</span>
   -  [ ] <span class="orange">Pagine casuali da wikipedia</span>
   -  [ ] costruzione dinamica di mappe con squeal geolocalizzati emessi ogni tot minuti
   -  [ ] servizi social con georeferenziazione (tipo dov'è il mio taxi/bus, caccia al tesoro, etc.)

## APP

- [ ] Accounting
  - [x] creazione account
  - [x] cambio password
  - [ ] reset password
  - [x] eliminazione account
  - [x] tipo di account: normale, <span class="orange">verificato</span>, professional, moderator.
  - [ ] scelta di un social media manager, rimozione SMM (sia utente che SMM devono essere professional).
  - [ ] <span class="orange">aquisto caratteri aggiuntivi giornalieri, settimanali, mensili (solo per verificati e PRO)</span>
  - [ ] <span class="orange">acquisto di canali personalizzati</span>
  - [ ] <span class="orange">aggiunta di amministratori a canali privati</span>
- [x] LETTURA SENZA LOGIN: solo canali ufficiali squealer
- [ ] LETTURA CON LOGIN: 
  - [x] feed con messaggi personali, canali a cui sono iscritto, canali ufficiali.
  - [x] destinarati @, § e #.
  - [x] ricerca per canale, keyword e menzione (corpo del testo).
  - [x] Reazioni: like, dislike, love, hate.
  - [ ] Iscrizione e rimozione da canali non ufficiali a scelta dell'utente.
- [ ] SCRITTURA (SOLO LOGIN):
  - [x] Creazione di un nuovo squeal (testo, immagine <span class="orange">da fotocamera</span>, geolocazione).
  - [x] Risposte a Squeal altrui (condivide destinatari e reazioni(???))
  - [x] Counter sempre aggiornati con caratteri residui.
  - [x] Specifica dei destinatari (§canale, @utente, #keyword).
  - [x] Ripetizione del messaggio ogni tot secondi (con parti variabili, beep acustico ad ogni ripetizione)

## MODERATOR DASHBOARD

- [x] Elencare utenti e filtrare per nome, tipo e popolarità.
- [x] Possibilità di bloccare e sbloccare utenti.
- [x] Possibilità di aumentare e diminuire la quota di caratteri di un utente.
- [x] Elencare Squeal e filtrare per utente, mittente, data e destinatari.
- [x] Possiilità di cambiare i destinatari (aggiungere canali ufficiali).
- [x] <span class="green">Possibilità di cambiare il numero di reazioni positive e negative</span>
- [x] <span class="orange">Moderazione di canali privati: elencare canali privati e filtrarli per proprietari, numero di post, popolarità . Cambiare i proprietari e il nome del canale. Bloccare un canale</span>
- [x] Elencare canali ufficiali, aggiungerne di nuovi, cambiare la descrizione. Aggiungere uno squeal ad un canale ufficiale.
- [ ] <span class="orange">Aggiungere una regola che attribuisce automaticamente un post ad un canale se soddisfa un certo criterio.</span>

## SOCIAL MEDIA MANAGER DASHBOARD

- [x] sia VIP che SMM devono essere account pro
- [x] <span class="orange">SMM può gestire diversi account VIP</span>
- [ ] SMM posta squeal a nome e per conto del VIP.
- [ ] Statistiche sugli squeal postati dal SMM (visualizzazioni, reazioni, squeal a rischio impopolarità/controversia, etc).
- [ ] <span class="orange">SMM può acquistare caratteri extra per i VIP</span>
- [ ] <span class="orange">Grafici con andamenti dei post dei VIP</span>
- [ ] <span class="green">Geolocazione fittizia per i VIP ????????</span>

## REQUISITI DI PROGETTO

- [ ] <span class="green">Database già pienotto</span>
- [ ] <span class="green">6 account: fv, fvPro, fvSMM, fvMod + 2 di tipo pro (il primo molto popolare, il secondo molto impopolare); fvPro e gli altri due pro sono gestiti da fvSMM</span>
- [ ] <span class="green">ACCESIBILITÀ</span>
