#!/bin/bash

./node_modules/.bin/truffle test ./test/1_BiometridsToken.js
./node_modules/.bin/truffle test ./test/2_PreSalePricingStrategyTest.js
./node_modules/.bin/truffle test ./test/3_IcoStagesPricingStrategy.js
