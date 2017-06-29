import React from 'react'
import Link from 'next/link'
import 'isomorphic-fetch'

class Swatch extends React.Component {

  render(){

    let swatchStyle = {
      padding: 10,
      margin: 20,
      display: "inline-block",
      backgroundColor: this.props.bgColor,
      width: 50,
      height: 50
    }

    return (
      <div style={swatchStyle}>
        {this.props.bgColor}
      </div>
    )
  }
}

export default class HexPage extends React.Component {

  static async getInitialProps () {
    // eslint-disable-next-line no-undef
    //const res = await fetch('https://api.github.com/repos/zeit/next.js')
    const res = await fetch('http://localhost:3001/api/hexes');
    const json = await res.json();

    return json;
  }

  render () {

    let items = this.props;
    let arr = [];

    for(var i in items){
      arr.push(items[i]);
    }

    return (
      <div>
        <div>
          {arr.map((item, idx)=>{
            return (
              <Swatch key={idx + item.hex} bgColor={'#' + item.hex}/>
            )
          })}
        </div>
        <Link prefetch href='/preact'><a>How about preact?</a></Link>
      </div>
    )
  }
}
