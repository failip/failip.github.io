class Stage {
    constructor(number) {
        this.number = number;
        this.html = this.toHtml();
    }
    toHtml() {
        var stage = document.createElement('div');
        stage.classList.add('stage');
        var stage_image = document.createElement('img');
        stage_image.classList.add('img-fluid');
        stage_image.src = `https://www.smashbros.com/assets_v2/img/stage/stage_img${this.number}.jpg`;
        stage_image.alt = this.number;
        stage.appendChild(stage_image);
        return stage;
    }
}

class Ruleset {
    constructor(starters, counters, stageclause) {
        this.starters = starters;
        this.counters = counters;
        this.stageclause = stageclause;
    }
}

class Player {
    constructor(name) {
        this.name = name;
        this.wonStages = {};
    }
}

class Match {
    constructor(player1, player2, ruleset) {
        this.players = [ player1, player2 ];
        this.ruleset = ruleset;
        this.score = [ 0, 0 ];
        this.game = 1;
        this.firstpicker = null;
        this.bannedStages = [];
        this.playingOn = null;
    }

    start(firstpicker) {
        this.setupScore();
        this.setupPlayerNames();
        this.firstpicker = firstpicker;
        this.setupStarterStages();
        this.setupGame();
        var match = this;
        $('#undo').click(function() {
            match.undoLastBan();
        });
        $('#close-overlay').click(function() {
            match.undoLastBan();
            $('#overlay').hide();
        });
        $('#player1-won').click(function() {
            match.winGame(0);
        });
        $('#player2-won').click(function() {
            match.winGame(1);
        });
    }

    setupScore() {
        $('#score').text(`${this.score[0]}\xa0-\xa0${this.score[1]}`);
    }

    setupPlayerNames() {
        $('#player1').text(this.players[0].name);
        $('#player2').text(this.players[1].name);
        $('#player1-won').text(this.players[0].name);
        $('#player2-won').text(this.players[1].name);
    }

    banStage(stage) {
        $(stage).hide();
        this.bannedStages.push(stage);
        this.setupGame(stage);
    }

    undoLastBan() {
        $(this.bannedStages.pop()).show();
        this.setupGame();
    }

    setupGame(stage) {
        $('#info-subtext').text(`Game ${this.game}`);
        if (this.game == 1) {
            this.setupGameStarter(stage);
        } else {
            this.setupGameCounter(stage);
        }
    }

    setupGameStarter(stage) {
        var bans = this.bannedStages.length;
        if (bans == 4) {
            this.playingOn = $(stage).children().attr('alt');
            $('#stage-name').text(stages[this.playingOn]);
            $('#stage-to-play').attr('src', $(stage).children().attr('src'));
            $('#overlay').show();
        } else {
            if (bans == 0) {
                this.setupBanning(this.players[this.firstpicker].name);
            } else if (bans == 3) {
                this.setupPicking(this.players[this.firstpicker].name);
            } else {
                this.setupBanning(this.players[(this.firstpicker + 1) % 2].name);
            }
        }
    }

    setupStarterStages() {
        $('#stages').empty();
        for (var i in this.ruleset.starters) {
            var stage = new Stage(this.ruleset.starters[i]);
            $('#stages').append(stage.html);
        }
        var match = this;
        $('div.stage').click(function() {
            match.banStage(this);
        });
    }

    setupCounterStage(not_playable) {
        $('#stages').empty();
        var stage_number;
        for (var i in this.ruleset.starters) {
            stage_number = this.ruleset.starters[i];
            if (!(stage_number in not_playable)) {
                var stage = new Stage(stage_number);
                $('#stages').append(stage.html);
            }
        }
        for (var j in this.ruleset.counters) {
            stage_number = this.ruleset.counters[j];
            if (!(stage_number in not_playable)) {
                var stage = new Stage(this.ruleset.counters[j]);
                $('#stages').append(stage.html);
            }
        }
        var match = this;
        $('div.stage').click(function() {
            match.banStage(this);
        });
    }

    setupGameCounter(stage) {
        var bans = this.bannedStages.length;
        if (bans == 3) {
            this.playingOn = $(stage).children().attr('alt');
            $('#stage-name').text(stages[this.playingOn]);
            $('#stage-to-play').attr('src', $(stage).children().attr('src'));
            $('#overlay').show();
        } else if (bans == 2) {
            this.setupPicking(this.players[(this.firstpicker + 1) % 2].name);
        } else {
            this.setupBanning(this.players[this.firstpicker].name);
        }
    }

    setupPicking(playername) {
        $('#info').text('Picking:\xa0');
        $('#info').css('color', 'rgb(4, 120, 4)');
        $('#playername').text(playername);
    }

    setupBanning(playername) {
        $('#info').text('Banning:\xa0');
        $('#info').css('color', 'rgb(169, 2, 2)');
        $('#playername').text(playername);
    }

    winGame(winner) {
        this.score[winner] += 1;
        this.game += 1;
        this.setupScore();
        var crown = document.createElement('i');
        crown.classList.add('fas', 'fa-crown', 'ml-1', 'mr-1');
        if (winner == 0) {
            $('#player1').empty();
            $('#player1').text(this.players[0].name);
            $('#player1').append(crown);
            $('#player2').empty();
            $('#player2').text(this.players[1].name);
        } else {
            $('#player2').empty();
            $('#player2').text(this.players[1].name);
            $('#player2').prepend(crown);
            $('#player1').empty();
            $('#player1').text(this.players[0].name);
        }
        if (this.stageclause) {
            this.players[winner].wonStages[this.playingOn] = undefined;
        }
        this.firstpicker = winner;
        this.setupCounterStage(this.players[(winner + 1) % 2].wonStages);
        this.bannedStages = [];
        this.playingOn = null;
        this.setupGame();
        $('#overlay').hide();
    }
}

function startNewMatch(player1, player2, firstpick) {
    var genesis_rules = new Ruleset([ 1, 3, 39, 40, 44 ], [ 42, 19, 37, 62, 79, 85 ], true);
    var frostbite_rules = new Ruleset([ 1, 3, 85, 40, 44 ], [ 79, 39, 37, 19 ], false);
    var match = new Match(player1, player2, frostbite_rules);
    match.start(firstpick);
}

var player1, player2, firstpick;

$('#begin-match').click(function() {
    var player1name = $('#player1name').val();
    var player2name = $('#player2name').val();
    if (!player1name || !player2name) {
        $('.alert').css('display', 'block');
        return;
    }
    player1 = new Player(player1name);
    player2 = new Player(player2name);
    $('#names').hide();
    $('#player1-firstpick').text(player1name);
    $('#player2-firstpick').text(player2name);
    $('#firstpick').show();
});

$('#begin-match-no-names').click(function() {
    player1 = new Player('Player 1');
    player2 = new Player('Player 2');
    $('#names').hide();
    $('#firstpick').show();
});

$('#player1-firstpick').click(function() {
    startNewMatch(player1, player2, 0);
    $('#name-input').hide();
});

$('#player2-firstpick').click(function() {
    startNewMatch(player1, player2, 1);
    $('#name-input').hide();
});

stages = {
    '1': 'Battlefield',
    '3': 'Final Destination',
    '39': 'Lylat Cruise',
    '40': 'Pokémon Stadium 2',
    '44': 'Smashville',
    '19': "Yoshi's Story",
    '37': "Yoshi's Island (Brawl)",
    '62': 'Unova Pokémon League',
    '79': 'Kalos Pokémon League',
    '85': 'Town & City',
    '42': 'Castle Siege'
};
