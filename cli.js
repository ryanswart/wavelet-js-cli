#!/usr/bin/env node
'use strict'
const React = require('react')
const importJsx = require('import-jsx')
const { render } = require('ink')
const meow = require('meow')

const ui = importJsx('./ui.jsx')

const cli = meow(`
	Usage
	  $ wavelet-cli

	Options
    --host The api host you want to hit (default: https://testnet.perlin.net)
		--pk Your Hex Encoded Private Key (eg)
    --deploy Path to Smart Contract .wasm file
    --gasLimit Amount of gas to limit transaction to
    --gasDeposit Amount of gas to deposit on an account

	Examples
	  $ wavelet-cli --pk=b17b734be77a8f3d8586349300574ab38aafedd15a814f61e7aa152abdc78b84
		Account Details...
`)

render(React.createElement(ui, cli.flags))
