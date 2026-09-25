'use client'
export default function ErrorPage({ reset }: { reset: () => void }) {
    return (
        <main style={{ padding: 60 }}>
            <h1>Nie udało się otworzyć strony</h1>
            <p>Spróbuj załadować ją ponownie.</p>
            <button onClick={reset}>Spróbuj ponownie</button>
        </main>
    )
}
