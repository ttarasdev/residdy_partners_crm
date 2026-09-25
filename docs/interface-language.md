# Język interfejsu

Panel partnera i panel specjalisty mają interfejs w języku polskim, zgodnie z panelem menedżera. Branding „Residdy Workflow” pozostaje bez zmian.

- Nawigacja, statusy i nazwy języków: `src/features/portal/config.ts`.
- Nazwy sekcji, kolumn i pól: `src/features/portal/resources.ts`.
- Pozostałe komunikaty znajdują się przy komponentach, które je wyświetlają.
- Dokument HTML używa `lang="pl"`, daty i liczby — `pl-PL`. Strefa terminów pozostaje `Europe/Warsaw`.
- Listy, nagłówki i wybór powiązanych konsultacji/kategorii pokazują `titlePl`.
- Formularze nadal obsługują wszystkie cztery wersje treści. Klucze API, wartości statusów, dane użytkowników i branding nie są tłumaczone.
- Błędy HTTP są prezentowane po polsku przez `errorMessage`; surowa odpowiedź pozostaje dostępna w obiekcie `ApiError` do diagnostyki.

Walidacja: `npm run typecheck`, `npm test`, `npm run test:browser`, `npm run lint`.

## Firmy i reklamy

Firma jest tylko do odczytu w panelu partnera. Tworzenie, zmiany i publikację obsługuje administrator w CRM menedżerów. W sprawie zmian partner kontaktuje się z opiekunem Residdy.

`BannerPreview.tsx` pokazuje wskazówki i orientacyjny podgląd wybranego formatu oraz polskiego tekstu. Mały baner kotwiczy obraz do dolnej krawędzi; duży ma proporcje 37:50. Po każdej edycji wymagana jest ponowna moderacja, aktywnego banera nie można edytować.
