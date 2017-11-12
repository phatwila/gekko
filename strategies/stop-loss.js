// Quick Stop Loss Strategy Extension which forwards function calls to this.strategy_${function}

var log = require('../core/log');

var stop = {};

stop.init = function() {
  this.loss = -1;

  if (this.stoploss_factor) {
    this.on('advice', function (advice) {
      if (advice.recommendation !== 'long') {
        return;
      }

      var price = advice.candle.close;
      this.loss = price - (price * this.stoploss_factor);
    });
  }

  // init the strategy
  if (this.strategy_init) {
    this.strategy_init();
  }
}

// update the strategy
stop.update = function(candle) {
  if (this.strategy_update) {
    this.strategy_update(candle);
  }
}

stop.log = function(candle) {
  if (this.loss !== -1) {
    log.info('Active Stop Loss at ' + this.loss);
  }

  if (this.strategy_log) {
    this.strategy_log(candle);
  }
}

// checking the stop loss price and ging short if nessessary.
// forwarding the candle to the strategy otherwise.
stop.check = function(candle) {
  var price = candle.close;

  if (this.loss !== -1 && price <= this.loss) {
    log.info('🔥 Stop Loss reached! Going short');
    this.advice('short');
    this.loss = -1;
    return;
  }

  if (this.strategy_check) {
    return this.strategy_check(candle);
  }
}

module.exports = stop;
