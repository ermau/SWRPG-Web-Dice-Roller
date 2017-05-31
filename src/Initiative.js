import React, { Component } from 'react';
import * as firebase from 'firebase';
import './index.css';

var channel = window.location.pathname.slice(1).toLowerCase();

class Initiative extends Component {
  constructor() {
    super();
    this.state = {
      slideout: 'none',
      message: {},
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
      InitiativeRef: firebase.database().ref().child(`${channel}`).child('Initiative').child('order'),
      Initiative: {},
      InitiativePastRef: firebase.database().ref().child(`${channel}`).child('Initiative').child('past'),
      InitiativePast: {},
      position: {},
      positionRef: firebase.database().ref().child(`${channel}`).child('Initiative').child('position'),
    };
  }

  componentDidMount() {
    this.state.messageRef.on('value', snap => {
      if (snap.val() != null) {
      this.setState({
        message: snap.val()
        });
      } else {
        this.setState({
          message: 0
          });
      }
    });

    this.state.InitiativeRef.on('value', snap => {
      if (snap.val() != null) {
      this.setState({
        Initiative: snap.val()
        });
      } else {
        this.setState({
          Initiative: 0
        });
      }
    });

    this.state.InitiativePastRef.on('value', snap => {
      if (snap.val() != null) {
      this.setState({
        InitiativePast: snap.val()
        });
      } else {
        this.setState({
          InitiativePast: 0
        });
      }
    });

    this.state.positionRef.on('value', snap => {
      if (snap.val() != null) {
      this.setState({
        position: snap.val()
        });
      } else {
        this.setState({
          position: {
            round: 1,
            turn: 1
          }
        });
      }
    });
  }

slideOut() {
  if (this.state.slideout !== 'none'){
    this.setState({slideout: 'none'});
  } else {
    this.setState({slideout: 'block'});
  }
}

InitiativeAdd() {
  this.state.InitiativeRef.push().set('PC');
}

InitiativeRemove() {
  if (this.state.Initiative !== 0) {
    this.state.InitiativeRef.child(Object.keys(this.state.Initiative)[Object.keys(this.state.Initiative).length-1]).remove();
  }
}

InitiativePrevious() {
  let position = Object.assign({}, this.state.position);
  let Initiative = Object.assign({}, this.state.Initiative);
  let InitiativePast = Object.assign({}, this.state.InitiativePast);
  if (position.turn === 1 && position.round === 1) {
    return;
  }
  if (this.total() === 0) {
    position.turn = 1;
    position.round = 1;
  } else if (position.turn - 1 < 1) {
    position.turn = this.total();
    position.round--;
    InitiativePast = Initiative;
    Initiative = {};
    Initiative[Object.keys(InitiativePast)[Object.keys(InitiativePast).length-1]] = Object.values(InitiativePast)[Object.values(InitiativePast).length-1];
    delete InitiativePast[Object.keys(InitiativePast)[Object.keys(InitiativePast).length-1]];
  } else {
    position.turn--;
    Initiative[Object.keys(InitiativePast)[Object.keys(InitiativePast).length-1]] = Object.values(InitiativePast)[Object.values(InitiativePast).length-1];
    delete InitiativePast[Object.keys(InitiativePast)[Object.keys(InitiativePast).length-1]];
  }
  this.state.positionRef.set(position);
  this.state.InitiativeRef.set(Initiative);
  this.state.InitiativePastRef.set(InitiativePast);
}

InitiativeNext() {
  if (this.total() === 0) {
    return;
  }
  let position = Object.assign({}, this.state.position);
  let Initiative = Object.assign({}, this.state.Initiative);
  let InitiativePast = Object.assign({}, this.state.InitiativePast);
  if (position.turn >= this.total()) {
    position.turn = 1;
    position.round++;
    InitiativePast[Object.keys(Initiative)[0]] = Object.values(Initiative)[0];
    Initiative = InitiativePast;
    InitiativePast = 0;
  } else {
    position.turn++;
    InitiativePast[Object.keys(Initiative)[0]] = Object.values(Initiative)[0];
    delete Initiative[Object.keys(Initiative)[0]];
  }
  this.state.positionRef.set(position);
  this.state.InitiativeRef.set(Initiative);
  this.state.InitiativePastRef.set(InitiativePast);
}

flip (v, k) {
  if (v === 'PC') {
    this.state.InitiativeRef.child(k).set('NPC');
  } else {
    this.state.InitiativeRef.child(k).set('PC');
  }
}

flipPast (v, k) {
  if (v === 'PC') {
    this.state.InitiativePastRef.child(k).set('NPC');
  } else {
    this.state.InitiativePastRef.child(k).set('PC');
  }
}

total() {
  return (Object.keys(this.state.Initiative).length + Object.keys(this.state.InitiativePast).length);
}

  render() {
    return (
      <div>
        <div className='destiny-box' style={{display: this.state.slideout}}>
          <div style={{float: 'left', marginLeft: 6}}>
            <button onClick={this.InitiativeAdd.bind(this)} className='btnAdd' style={{display: 'inline-block'}}>+</button>
            <button onClick={this.InitiativeNext.bind(this)}className='btnAdd' style={{display: 'inline-block'}}>→</button>
            <br/>
            <button onClick={this.InitiativeRemove.bind(this)} className='btnAdd' style={{display: 'inline-block'}}>-</button>
            <button onClick={this.InitiativePrevious.bind(this)}className='btnAdd' style={{display: 'inline-block'}}>←</button>
          </div>
          <div style={{marginLeft: '45px'}}>
            {Object.entries(this.state.Initiative).map(([k,v])=>
              <span
              key={k}
              onClick={this.flip.bind(this, v, k)}>
              <img
                src={`/images/${v}.png`}
                alt={v}
                className='tokens' />
              </span>
            )}
            <img src={`/images/repeat.png`} alt='' className='tokens' />
            {Object.entries(this.state.InitiativePast).map(([k,v])=>
              <span
              key={k}
              onClick={this.flipPast.bind(this, v, k)}>
              <img
                src={`/images/${v}.png`}
                alt={v}
                className='tokens' />
              </span>
            )}
          </div>
        </div>
        <button type="button" style={{marginBottom: '0.5em'}}onClick={this.slideOut.bind(this)} className='lrgButton'>Show Initiative</button>
        <span>Round: {this.state.position.round}<nsbr/> Turn: {this.state.position.turn}</span>
      </div>
    );
  }
}
  export default Initiative;
