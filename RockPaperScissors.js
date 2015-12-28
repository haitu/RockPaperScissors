SymbolSelections = new Mongo.Collection("symbolSelections");
var firstPlayerName	= "player1";
var secondPlayerName	= "player2";
if (Meteor.isClient) {
	Meteor.subscribe("symbolSelections");

	Template.finalResultTemplate.helpers({
		finalResult: function () {
			var finalResult = "";
			var player1 =SymbolSelections.findOne({username:firstPlayerName});
			var player2 =SymbolSelections.findOne({username:secondPlayerName});
			if(player1 && player2)
			{
				var winner = null;
				if(player1.selectedSymbol == 1)
				{
					if(player2.selectedSymbol == 2)
						winner = player2;
					else if(player2.selectedSymbol == 3)
						winner = player1;
				}else if(player1.selectedSymbol == 2)
				{
					if(player2.selectedSymbol == 1)
						winner = player1;
					else if(player2.selectedSymbol == 3)
						winner = player2;
				}else if(player1.selectedSymbol == 3)
				{
					if(player2.selectedSymbol == 1)
						winner = player2;
					else if(player2.selectedSymbol == 2)
						winner = player1;
				}
				if(!winner)
				{
					finalResult = "Tie";
				}else
				{
					finalResult = winner.username +" won";
				}
			}
			return finalResult;
		}
	});
  
	Template.body.helpers({
		symbolSelections1: function () {
			return SymbolSelections.find({});
		},
		buttonArray: function () {
			var arr = [{"buttonId":1,"color":"rgb(221,221,221)",name : "rock",displayName : "Rock","disabledAttr":""},
			{"buttonId":2,"color":"rgb(221,221,221)",name:"paper",displayName:"Paper","disabledAttr":""},
			{"buttonId":3,"color":"rgb(221,221,221)",name:"scissor",displayName:"Scissor","disabledAttr":""}];
			var selectedSymbolNumber = 0;
			var selected = SymbolSelections.findOne({owner: Meteor.userId()});
			if(selected)
			{
				var selectedNumber = selected.selectedSymbol;
				if(selectedNumber > 0)
				{
					arr[selectedNumber - 1].color = "red";
				}
			}
			
			var player1 =SymbolSelections.findOne({username:firstPlayerName});
			var player2 =SymbolSelections.findOne({username:secondPlayerName});
			var gameOver = false;
			if(player1 && player2)
			{
				gameOver = true;
			}
			for(var i = 0;i < arr.length;i ++)
			{
				arr[i].disabledAttr = gameOver ? "disabled":"";
			}
			return arr;
		}
	});
  

    Template.buttonForSymbol.events({
    'click button': function (event) {
		var symbolName = event.target.name;
		Meteor.call("selectSymbol",symbolName);	
    }
  });
  
	Template.rbs.events({
		'click button': function (event) {
			Meteor.call("resetGame");
		}
	});
  
  
	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});
}

if (Meteor.isServer) {
	Meteor.startup(function () {
	});

	Meteor.publish("symbolSelections", function () {
		return SymbolSelections.find({});
	});
}

Meteor.methods({
	selectSymbol : function(symbol)
	{
		var getSymbolNumber = function(symbolName)
		{
			if(symbolName === "rock")
			{
				return 1;
			}else if(symbolName === "paper")
			{
				return 2;
			}else if(symbolName === "scissor")
			{
				return 3;
			}
		}
	
		var symbolNumber = getSymbolNumber(symbol);
		var foundSymbol = SymbolSelections.find({owner:Meteor.userId()});
		if(foundSymbol.count() == 0)
		{
			SymbolSelections.insert({
				owner: Meteor.userId(),
				username: Meteor.user().username,
				selectedSymbol : symbolNumber
			});
		}

		SymbolSelections.update({owner:Meteor.userId()},{
				owner: Meteor.userId(),
				username: Meteor.user().username,
				selectedSymbol : symbolNumber
			});
		
	},
	resetGame: function()
	{
		SymbolSelections.remove({});
		SymbolSelections.insert({finalResult:"Please select your symbol",finalResultFlag:1});
	}
});
