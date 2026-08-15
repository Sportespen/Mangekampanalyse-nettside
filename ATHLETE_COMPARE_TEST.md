# Test: ekstern utøver + Hva hvis

Denne grenen er kun for testing og skal ikke merges til `main` mens Birmingham-løsningen er i aktiv bruk.

Funksjoner i testen:
- Navnesøk etter ekstern mangekamputøver.
- Tikamp menn / sjukamp kvinner filtreres separat.
- World Athletics-ID håndteres i bakgrunnen.
- Prognose bruker samme hovedregel: tre beste av de fire siste gyldige seniorresultatene fra 2025–2026; færre resultater brukes hvis nødvendig.
- Hva hvis-scenario kan overstyre én eller flere øvelser og beregner nytt sluttresultat.

Produksjonskoden på `main` er ikke endret av denne testen.
