/*
  STEVE!
  ---------------------------------------------
  Coppock + PSAR + EMA Crossover Indicator Strategy
  ---------------------------------------------

 */
var _ = require('lodash');
var log = require('../core/log.js');

// Let's create our own method
var method = {};


// Prepare everything our method needs
method.init = function() {

        // strat name
        this.name = 'coppock';

        // tulip indicators use this sometimes
        this.requiredHistory = 30;

        //period object setup
        this.coppock = {
            wma: {
                optInTimePeriod: 10
            },
            roc1: {
                optInTimePeriod: 14
            },
            roc2: {
                optInTimePeriod: 11
            },
        };

        // define the indicators we need
        this.addTulipIndicator('mywma', 'wma', this.coppock.wma);
        this.addTulipIndicator('myroc1', 'roc', this.coppock.roc1);
        this.addTulipIndicator('myroc2', 'roc', this.coppock.roc2);
        this.addTulipIndicator('mypsar', 'psar', this.settings.psar);
        this.addTulipIndicator('myema1', 'ema', this.settings.ema1);
        this.addTulipIndicator('myema2', 'ema', this.settings.ema2);

}
// What happens on every new candle?
method.update = function(candle) {
    this.firstRoCs = [];
    //get the indicator results
    this.wma = this.tulipIndicators.mywma.result.result;
    this.roc1 = this.tulipIndicators.myroc1.result.result;
    this.roc2 = this.tulipIndicators.myroc2.result.result;
    this.psar = this.tulipIndicators.mypsar.result.result;
    this.ema1 = this.tulipIndicators.myema1.result.result;
    this.ema2 = this.tulipIndicators.myema2.result.result;
    this.candleDate = candle.start;

    this.wmaNominator = 0;

    this.firstRoCs.push(this.roc1);

    if (this.firstRoCs.length > this.wma) {
        log.debug('Removing first ROC and returning');
        this.firstRoCs.shift();
    }

    this.firstRoCs.forEach(function(roc, index) {
        this.wmaNominator += roc * (index + 1);
    });
	
    this.coppock = (this.wmaNominator / ((this.wma / 2) * (this.wma + 1))) + this.roc2;
}

// for debugging purposes log the last
// calculated parameters.
method.log = function() {
	    log.debug(
        `
    ---------------------
    Coppock + PSAR + EMA Crossover values
          Date: ${this.candleDate}
     Tulip WMA: ${this.wma}
    Tulip ROC1: ${this.roc1}
    Tulip ROC2: ${this.roc2}
    Tulip PSAR: ${this.psar}
    Tulip EMA1: ${this.ema1}
    Tulip EMA2: ${this.ema2}
	Coppock: ${this.coppock}
    `);

}

method.check = function(candle) {
	
	this.candleClose = candle.close;
	
    // just add a long and short to each array when new indicators are used
    const all_long = [
        this.coppock > 0,
        this.ema1 > this.ema2,
		this.psar > this.candleClose,
    ].reduce((total, long)=>long && total, true)
    const all_short = [
        this.coppock < 0,
        this.ema1 < this.ema2,
		this.psar < this.candleClose,
    ].reduce((total, long)=>long && total, true)
   
   // combining all indicators with AND
    if(all_long){
        console.log(`BUY SIGNALED - Executing trade...`);
        this.advice('long');
    }else if(all_short){
        console.log(`SELL SIGNALED - Executing trade...`);
        this.advice('short');
    }else{
        console.log(`No change in trend.`);
        this.advice();
    }
	
}

module.exports = method;