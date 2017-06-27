import React from 'react'
import Link from 'next/link'
import 'isomorphic-fetch'

export default class HexPage extends React.Component {

  static async getInitialProps () {
    // eslint-disable-next-line no-undef
    //const res = await fetch('https://api.github.com/repos/zeit/next.js')
    const res = await fetch('http://localhost:3001/api/hexes');
    const json = await res.json();
    console.log(json);
    return json;
  }

  render () {
    return (
      <div>
        <p>Next.js has {this.props} ⭐️</p>
        <Link prefetch href='/preact'><a>How about preact?</a></Link>
      </div>
    )
  }
}
