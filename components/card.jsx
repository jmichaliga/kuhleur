import React from 'react';
import ReactDOM from 'react-dom';

var Card = React.createClass({
    getInitialState: function{},
    render: function(){
        return (
            <div>
                <h1>Card of #{this.props.hex}</h1>
            </div>
        )
    }
});
