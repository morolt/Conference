## Conference

A simple Ethereum smart contract  example. 

For noobs! There might be bugs here.

From https://github.com/eshon/conference ,Fixes some bugs.

### Updates

Current code uses *Truffle v4.0.6*


### Install

Install [Ganache](http://truffleframework.com/ganache/)/[Ganache-cli](https://github.com/trufflesuite/ganache-cli)(or use geth)

```bash
$ npm install -g ganache-cli
```

Install [truffle](https://github.com/consensys/truffle):

```bash
$ npm install -g truffle 
```

### Run

Run Ganache-cli in one console window or run Ganache:

```
$ ganache-cli
```
In another console window run truffle from project root directory:

```bash
$ npm install
$ truffle compile
$ truffle migrate
$ truffle test
$ npm run dev // server at localhost:8080
```