import '../styles/globals.css'
import Head from 'next/head'
import { ThemeProvider } from '../contexts/ThemeContext'

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Head>
        <title>Terriclans</title>
        <meta name="description" content="Manage and join gaming clans" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
