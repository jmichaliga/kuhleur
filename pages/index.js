import React from 'react'
import Link from 'next/link'

export default () => (
  <div>
    <h1>kuhleur</h1>
    <ul>
      <li><Link href='/b' as='/a'><a>a</a></Link></li>
      <li><Link href='/a' as='/b'><a>b</a></Link></li>
      <li><Link href='/preact'><a>Preact Fetch</a></Link></li>
    </ul>
  </div>
)
