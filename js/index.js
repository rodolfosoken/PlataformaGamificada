(function () {

  /**
  * Gamify library (framework agnostic, pure js gamification)
  * Copyright (C) 2015 Hans Doller <hans@ticonerd.com>
  *
  * This program is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * This program is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  **/

  var
  noop = function() {},
  noopTrue = function() { return true; },
  noopThis = function() { return this; };

  function dateNorm(d) {
    if(!!d && d instanceof Date) return d;
    var dMs = Date.parse(d);
    if(isNaN(dMs)) throw 'Invalid date provided.';
    return new Date(dMs);
  }

  function EventHub(opts) {
    this.opts = opts||{};
  }

  EventHub.prototype = {
    init: function(game) {
      this.game = game;
      return this;
    },
    sync: function (backlog) {
      this.game.trackers // clear all back history on trackers
        .forEach(function (tracker) {
          return tracker.flush();
        });

      if(!backlog || !backlog.length) {
        return;
      }

      backlog
        .filter(EventHub.validEntry.bind(EventHub))
        .forEach((function (entry) {
          this.trigger(entry.action, entry.params, entry.date);
        }).bind(this));
    },
    trigger: function(action, params, time) {
      if(!action) {
        throw new Error('Action must be provided.');
      }

      params = params || [];
      time   = dateNorm(time || new Date);

      this.game.trackers // notify all trackers of this triggered action
        .forEach(function (tracker) {
          return tracker.notify(action, params, time);
        });
      this.game.markDirty();
    }
  };

  EventHub.validEntry = function (v) {
    return !!v && !!v.action && !!v.date;
  };

  function Tracker(opts) {
    this.opts = opts||{};
  }

  Tracker.prototype = {
    init: function(game) {
      this.game = game;
      this.id       = this.opts.id       || this.id;
      this.onMatch  = this.opts.onMatch  || this.onMatch  || noop;
      this.onNotify = this.opts.onNotify || this.onNotify || noopTrue;
      this.onFlush  = this.opts.onFlush  || this.onFlush  || noopThis;

      (this.opts.onInit||noop).call(this, game);
      this.flush();

      return this;
    },
    notify: function(action, params, time) {

      var
      resultCb = this.onNotify(action, params, time);

      if(resultCb === true) {
        this.onMatch(action, params, time);
        this.game.notify(this, action, params, time);
      }

      return resultCb;
    },
    flush: function () {
      return this.onFlush() || this;
    }
  };

  Tracker.isTracker = function (v) {
    return !!v && typeof(v) === 'object' && v instanceof Tracker;
  };

  function TrackerAchievement() {
    Tracker.apply(this, arguments);
  }

  TrackerAchievement.prototype = new Tracker();
  TrackerAchievement.prototype.dateUnlocked = function () {
    return this.unlocked || false;
  };
  TrackerAchievement.prototype.isUnlocked = function () {
    return !!this.unlocked;
  };
  TrackerAchievement.prototype.setUnlocked = function (date) {
    this.unlocked = date;
    return this;
  };
  TrackerAchievement.prototype.getProgress = function () {
    return this.progress;
  };
  TrackerAchievement.prototype.setProgress = function (progress, date) {
    this.progress = progress;

    if(!isNaN(progress) && !!date) {
      this.game.progress(this, progress, date);
    }
    return this;
  };
  TrackerAchievement.prototype.notify = function (action, params, date) {
    if(this.isUnlocked()) return false; // do not signal superclass.
    return Tracker.prototype.notify.apply(this, arguments);
  };
  TrackerAchievement.prototype.flush = function () {
    this.setUnlocked(false);
    this.setProgress(false);
    return Tracker.prototype.flush.apply(this, arguments);
  };

  Tracker.Achievement = TrackerAchievement;

  function Gamify(opts) {
    this.opts = opts||{};
    this.reset();
  }

  Gamify.prototype = {
    reset: function() {
      this.onProgress = this.opts.onProgress || this.onProgress || noop;
      this.onNotify = this.opts.onNotify || this.onNotify || noop;
      this.eventHub = (new EventHub()).init(this);
      this.trackers = (this.opts.trackers||[])
        .filter(Tracker.isTracker.bind(Tracker))
        .map((function (item) { return item.init(this); }).bind(this));

      // sync the eventHub with all trackers (optional)
      this.eventHub.sync(this.opts.backlog);

      // now we can expose the trigger
      this.trigger = this.eventHub.trigger.bind(this.eventHub);
      this.markClean();
    },
    markClean: function() {
      this.dirty = false;
      return this;
    },
    markDirty: function() {
      this.dirty = true;
      return this;
    },
    isDirty: function() {
      return this.dirty;
    },
    progress: function(tracker, progress, time) {
      return this.onProgress.apply(this, arguments);
    },
    notify: function(tracker, action, params, time) {
      return this.onNotify.apply(this, arguments);
    }
  };

  Gamify.EventHub = EventHub;
  Gamify.Tracker  = Tracker;

  window.Gamify = Gamify;
})();








///
/// Angular demo implementation
///

angular
.module('GamifyApp', ['luegg.directives'])
.factory('ngGamify', function() {
  if(window.Gamify === undefined) throw 'Gamify library not included';
  return window.Gamify;
})

.controller('MainCtrl', function ($scope, ngGamify, Achievement1, Achievement2, Achievement3, Achievement4, Achievement5) {
  
  $scope.log = [];
  $scope.replay = [];
  // $scope.hideLog = true;
  $scope.event1 = 'Event1';
  $scope.event2 = 'Event2';
  $scope.button1 = 'button1';
  $scope.button2 = 'button2';
  
  $scope.resetLog   = function () {
    $scope.log.splice(0, $scope.log.length);
  };

  $scope.resetReplay = function() {
    $scope.replay.splice(0, $scope.replay.length);
  };

  $scope.loadReplay = function() {
    var data = JSON.parse($scope.replayJson);
    $scope.resetReplay(); // so we don't double it up.
    $scope.gamify.eventHub.sync(data);
  };

  $scope.$watch('replay', function(nV) {
    $scope.replayJson = JSON.stringify(nV);
  }, true);
  
  $scope.isValidJson = function(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  function pushLog(message, debug) {
    $scope.log.push({ message: message, debug: debug, date: new Date });
  }

  var
  now = new Date,
  gamify = $scope.gamify = new ngGamify({
    onNotify: function(tracker, action, params, date) {
      pushLog(tracker.id + ' awarded', {date: date})
    },
    onProgress: function(tracker, progress, date) {
      pushLog(tracker.id + ' made progress', {date: date, progress: progress});
    },
    trackers: [
      
      $scope.testTracker = new ngGamify.Tracker({
        id: 'log-tracker',
        onNotify: function(action, params, date) {
          pushLog(this.id + ' was notified', {action: action, params: params, date: date});
          $scope.replay.push({action: action, params: params, date: date});
        }
      }),

      $scope.testAchievement1 = new Achievement1('achievement_1', $scope.event1, $scope.button1),
      $scope.testAchievement2 = new Achievement2('achievement_2', $scope.event1, $scope.button1, 3, $scope.event1, $scope.button2, 1),
      $scope.testAchievement3 = new Achievement3('achievement_3', $scope.event2, $scope.button2, $scope.event1, $scope.button1, 1000),
      $scope.testAchievement4 = new Achievement4('achievement_4', [
          'achievement_1',
          'achievement_2',
          'achievement_3'
        ], $scope.event2, $scope.button1),
      $scope.testAchievement5 = new Achievement5('achievement_5')
    ]
    /*, backlog: [ // auto-completes all achievements
      {action: $scope.event1, params: [$scope.button1], date: now},
      {action: $scope.event1, params: [$scope.button1], date: now},
      {action: $scope.event1, params: [$scope.button1], date: now},
      {action: $scope.event1, params: [$scope.button2], date: now},
      {action: $scope.event2, params: [$scope.button2], date: new Date(now.getTime() - 100)},
      {action: $scope.event1, params: [$scope.button1], date: now}
    ]*/
  });
})

// Achievement 1:
// awarded once when
// action=targetAction && p0=targetP0
.factory('Achievement1', function(ngGamify) {
  return function (id, targetAction, targetP0) {
    return new ngGamify.Tracker.Achievement({
      id: id,
      onNotify: function(action, params, date) {
        if(action !== targetAction || params[0] !== targetP0) return false;
        this.setUnlocked(date);
        return true;
      }
    });
  };
})

// Achievement 2:
// awarded once when
// action=target1Action && p0=target1P0 happens target1recur times and
// action=target2Action && p0=target2P0 target2recur times (includes a % progress)
.factory('Achievement2', function(ngGamify) {
  return function (id, target1Action, target1P0, target1recur, target2Action, target2P0, target2recur) {
    return new ngGamify.Tracker.Achievement({
      id: id,
      onNotify: function(action, params, date) {

        var
        p0 = params[0]||false,
        condition1 = (action === target1Action && p0 === target1P0),
        condition2 = (action === target2Action && p0 === target2P0),
        maxCondition1 = target1recur || 1,
        maxCondition2 = target2recur || 1;

        if(!condition1 && !condition2) return false;

        if(condition1 && this.countC1 < maxCondition1) {
          this.countC1++;
        }
        if(condition2 && this.countC2 < maxCondition2) {
          this.countC2++;
        }

        var completed = (this.countC1 + this.countC2) / (maxCondition1 + maxCondition2);

        if(this.getProgress() !== completed)
          this.setProgress(completed, date);

        if(completed < 1) {
          return false;
        }

        this.setUnlocked(date);
        return true;
      },
      onFlush: function() {
        this.countC1 = 0;
        this.countC2 = 0;
      }
    });
  };
})

// Achievement 3:
// awarded once when
// action=nextAction && p0=nextP0 immediately preceded by
// action=firstAction && p0=firstP0 (less than maxDelay ms before)
.factory('Achievement3', function(ngGamify) {
  return function (id, firstAction, firstP0, nextAction, nextP0, maxDelay) {
    maxDelay = isNaN(maxDelay) ? 0 : maxDelay;
    
    return new ngGamify.Tracker.Achievement({
      id: id,
      onNotify: function(action, params, date) {

        var
        p0 = params[0]||false,
        pAction = this.lastAction,
        pParam = this.lastParam,
        pTime = this.lastTime;

        this.lastAction = action;
        this.lastParam = p0;
        this.lastTime = date;

        if(!pAction) return false;

        var
        condition1 = (action === nextAction && p0 === nextP0),
        condition2 = (pAction === firstAction && pParam === firstP0 && date && pTime && (date.getTime() - pTime.getTime() <= maxDelay));

        if(!condition1 || !condition2) {
          return false;
        }

        this.setUnlocked(date);
        return true;
      },
      onFlush: function() {
        this.lastTime = false;
        this.lastAction = false;
        this.lastParam = false;
      }
    });
  };
})

// Achievement 4
// if all requiredAchievements completed without occurance of
// action=targetAction && p0=targetP0
.factory('Achievement4', function(ngGamify) {
  return function (id, requiredAchievements, targetAction, targetP0) {
    requiredAchievements = requiredAchievements || [];
    return new ngGamify.Tracker.Achievement({
      id: id,
      onInit: function(game) {
        this.getRequiredAchievements = function() {
          if(!this.game || !this.game.trackers || !this.game.trackers.length || !requiredAchievements) return [];
          return this.game.trackers
            .filter(function (tracker) {
              return (tracker instanceof ngGamify.Tracker.Achievement)
                && requiredAchievements.indexOf(tracker.id) !== -1;
            }); 
        };
      },
      onNotify: function(action, params, date) {
        if(this.tainted) return false;

        if(action === targetAction && params[0] === targetP0) {
          this.tainted = true;
          return false;
        }

        var
        reqAchieves = this.getRequiredAchievements(),
        othersCompleted = !reqAchieves.length || !!reqAchieves
          .every((function(achievement) {
            if(achievement === this) return true;
            return achievement.isUnlocked();
          }).bind(this));

        if(othersCompleted) {
          this.setUnlocked(date);
          return true;
        }

        return false;
      },
      onFlush: function() {
        this.tainted = false;
      }
    });
  };
})

// Achievement 5
// Awarded once when all other achievements are completed
.factory('Achievement5', function(ngGamify) {
  return function (id) {
    return new ngGamify.Tracker.Achievement({
      id: id,
      onInit: function(game) {
        this.getAchievements = function() {
          if(!this.game || !this.game.trackers || !this.game.trackers.length) return [];
          return this.game.trackers.filter(function (tracker) {
            return (tracker instanceof ngGamify.Tracker.Achievement);
          }); 
        };
      },
      onNotify: function(action, params, date) {
        var progress, unlocked = 0, completed, me = this;
        this.getAchievements().forEach((function (tracker) {
          if(tracker.isUnlocked()) {
            unlocked++;
            return
          }
          if(me === tracker) return;
          unlocked += tracker.getProgress();
        }).bind(this));

        progress = unlocked / (this.totalCount - 1);
        completed = progress === 1;

        if(this.getProgress() !== progress)
          this.setProgress(progress);

        if(completed) {
          this.setUnlocked(date);
        }

        return completed;
      },
      onFlush: function() {
        this.totalCount = this.getAchievements().length;
      }
    });
  };
});