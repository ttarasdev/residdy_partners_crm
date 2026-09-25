import Link from 'next/link'
export default function NotFound() {
    return (
        <main style={{ padding: 60 }}>
            <h1>Nie znaleziono strony</h1>
            <Link href="/main">Wróć do panelu</Link>
        </main>
    )
}
