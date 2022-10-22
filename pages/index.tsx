import type { NextPage } from 'next'
import Head from 'next/head'
import Inputs from "../components/inputs";
import Results from "../components/result"


const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Battery Simulator</title>
        <meta name="description" content="Simulating a battery with your own data" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Inputs />
      <Results />
      </div>
  )
}

export default Home
