// buyatsellat Strategy

// var _ = require('lodash');
var log = require('../core/log.js');

// let's create our own method
var method = {};

// prepare everything our method needs
method.init = function() {
    this.name = 'buyatsellat';

	// Pull settings from configuration instead of hardcoding.
    const buyat = this.settings.buyat
    const sellat = this.settings.sellat
    const stop_loss_pct = this.settings.stop_loss_pct
    const sellat_up = this.settings.sellat_up

    this.previousAction = 'sell';
    this.previousActionPrice = Infinity;
}

// What happens on every new candle?
method.update = function(candle) {
    //console.log('in update');
}

// for debugging purposes log the last 
// calculated parameters.
method.log = function(candle) {
    console.log(this.previousAction)
}

method.check = function(candle) {

    if (this.previousAction === "buy") {
        // calculate the minimum price in order to sell
        const threshold = this.previousActionPrice * buyat;

        // calculate the stop loss price in order to sell
        const stop_loss = this.previousActionPrice * stop_loss_pct;

        // we sell if the price is more than the required threshold or equals stop loss threshold
        if ((candle.close > threshold) || (candle.close < stop_loss)) {
            this.advice('short');
            this.previousAction = 'sell';
            this.previousActionPrice = candle.close;
        }
    } else if (this.previousAction === "sell") {
        // calculate the minimum price in order to buy
        const threshold = this.previousActionPrice * sellat;

        // calculate the price at which we should buy again if market goes up
        const sellat_up_price = this.previousActionPrice * sellat_up;

        // we buy if the price is less than the required threshold or greater than Market Up threshold
        if ((candle.close < threshold) || (candle.close > sellat_up_price)) {
            this.advice('long');
            this.previousAction = 'buy';
            this.previousActionPrice = candle.close;
        }
    }
}

module.exports = method;