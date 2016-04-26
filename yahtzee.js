//Javascript for Yahtzee project
//Written by Emily Huizenga
//Fall 2015

var rollCount = 0; 			  //keep track of how many times dice have been rolled
var numRolls = 3;  			  //roll limit variable
var numPlayers;	   			  //user defined number of players
var playerArr = new Array();  //array to hold the player objects
var numRounds = 13; 		  //round limit variable
var round = 1;				  //current round
var currentPlayer = 0;		  //who's turn is it
var numTurns = 0;			  //is it time to begin a new round?
var diceArray = [0,0,0,0,0];  //array to hold dice values

//create a player object
var Player = function(pName){
	this.pName = pName;

	this.leftTotal = 0;

	this.scores = {
		'1score': -1, '2score': -1, '3score': -1, '4score': -1, '5score':-1,
		'6score': -1, 'Bscore': -1, '3kscore': -1, 'FHscore': -1, '4kscore': -1,
		'SSscore': -1, 'LSscore': -1, 'Yscore': -1, 'Cscore': -1, 'score': 0
	}

	this.buttons = {
		'ones':true, 'twos':true, 'threes':true, 'fours':true, 'fives':true, 'sixes':true,
		'3k':true, 'FH':true, '4k':true, 'ss':true, 'ls':true, 'YZ':true,
		'chance':true
	}
}

//function to get players
function getPlayers(){
	numPlayers = prompt("How many players are there?");
	while (numPlayers == null || numPlayers == "") {
	   	numPlayers = prompt("Please enter the number of players!");
	}
	while(numPlayers <=0 || numPlayers >5){
		numPlayers = prompt("Players must be between 1 and 5. Try again");
	}

	//create the player objects
	for(i=0; i < numPlayers; i++){
		var pName = prompt("Please enter a name for player " + (i+1));
		var p = new Player(pName);
		playerArr.push(p);
		//create button for the player to display at the end of the game
		document.getElementById("playerbuttons").innerHTML += ("<input type='button' value='" + pName + "' id='" + i + "' onclick='display(this.id)' hidden >");
	}
	//display the first player's name
	document.getElementById('player').innerHTML=("It's " + playerArr[currentPlayer].pName + "'s Turn!");
}//end getPlayers

function changeTurn(){
	numTurns++; //someone just finished their turn

	//if all the players have gone, increment the round count
	if(numTurns == numPlayers){
		numTurns = 0;
		round++;
		document.getElementById("rnd").innerHTML=("Round " + round); //show the round
	}
	//check if the game is over. If not, move to the next player and reset the board
	if(round <= numRounds){
		currentPlayer = ((currentPlayer + 1) % (numPlayers)); //cycle through the players
		rollCount = 0; //reset the roll count
		document.getElementById('player').innerHTML=("It's " + playerArr[currentPlayer].pName + "'s Turn!"); //display the current player
		document.getElementById("roll").disabled = false; //enable the roll button for the new player

		//reset the dice and board between turns
		resetBoard();
		resetDice();
		//display the new score
		displayScore(playerArr[currentPlayer].scores, playerArr[currentPlayer].buttons);
	} else{
		//the game is over
		//check for a winner
		document.getElementById("rnd").innerHTML=""; //get rid of the round indicator
		document.getElementById('player').innerHTML=(""); //get rid of the turns
		document.getElementById("roll").disabled = true; //disable the buttons
		document.getElementById("next").disabled = true;
		resetDice();
		resetBoard();
		findWinner();
	}
}//end change turn

//function to roll the dice
function rollDice(){
	//reset the board
	resetBoard();
	//the player can only roll the dice 3 times per turn
	if (rollCount < numRolls){
		var limit=0; //interval limit
		//we want function roller to be called several times to simulate dice rolling
		//use set Interval to do this
		var diceRoller = setInterval(function(){
			roller();
			if(++limit==8){clearInterval(diceRoller);} //once the limit has been reached, stop the interval
		},300);

	//set a delay for the rest of the if statement so that it doesn't execute before the dice have finished
	setTimeout(function(){
			//display the score
			rollScore();
		}, 2700);
	}

	rollCount++;
	//show the roll number
	document.getElementById("rollCt").innerHTML=("Roll: " + String(rollCount));
	//disable the roll button after 3 rolls
	if(rollCount == 3){
		document.getElementById("roll").disabled = true;
	}
}//end rollDice

//function to get a random number and display its equivalent die image
function roller(){
	for(i=1; i<6; i++){
		//only roll if the box is unchecked
		if(!document.getElementById("box"+i).checked){
			diceArray[i]=getRandom(); //get a random number and use it to determine which picture to display
			document.getElementById("die"+i).src=("dice"+diceArray[i]+".png");
		}
	}
}

//function to get a random number
function getRandom(){
	return Math.floor((Math.random()*6)+1);
}

//function to calculate and show the results of the roll
function rollScore(){
	var ones =0, twos=0, threes=0, fours=0, fives=0, sixes=0;
	//count how many of each type there are
	for(i=0; i<=5; i++){
		if(diceArray[i] == 1) ones++;
		else if(diceArray[i] == 2) twos++;
		else if(diceArray[i] == 3) threes++;
		else if(diceArray[i] == 4) fours++;
		else if(diceArray[i] == 5) fives++;
		else if(diceArray[i] == 6) sixes++;
	}

	//display new scores if there isn't a score there already
	if(playerArr[currentPlayer].scores["1score"]==-1) writeVal(ones, "1score"); //ones
	if(playerArr[currentPlayer].scores["2score"]==-1) writeVal((twos*2), "2score"); //twos
	if(playerArr[currentPlayer].scores["3score"]==-1) writeVal((threes*3), "3score"); //threes
	if(playerArr[currentPlayer].scores["4score"]==-1) writeVal((fours*4), "4score"); //fours
	if(playerArr[currentPlayer].scores["5score"]==-1) writeVal((fives*5), "5score"); //fives
	if(playerArr[currentPlayer].scores["6score"]==-1) writeVal((sixes*6), "6score"); //sixes

	//calculate total score - used for chance, 3 of a Kind and 4 of a Kind
	var score = (ones + (twos*2) + (threes*3) + (fours*4) + (fives*5) + (sixes*6));

	//check for Yahtzee (5 of a kind)
	if(ones == 5 || twos == 5 || threes == 5 || fours == 5 || fives == 5 || sixes == 5){
		if(playerArr[currentPlayer].scores["Yscore"]==-1) writeVal(50, "Yscore");
	}

	//check for 3 of a kind
	if(ones >= 3 || twos >= 3 || threes >= 3 || fours >= 3 || fives >= 3 || sixes >= 3) {
		if(playerArr[currentPlayer].scores["3kscore"]==-1) writeVal(score, "3kscore");
	}
	//check for full house
	if(ones == 3 || twos == 3 || threes == 3 || fours == 3 || fives == 3 || sixes == 3) {
		if(ones == 2 || twos == 2 || threes == 2 || fours == 2 || fives == 2 || sixes == 2) {
			if(playerArr[currentPlayer].scores["FHscore"]==-1) writeVal(25, "FHscore");
		}
	}
	//check for 4 of a kind
	if(ones >= 4 || twos >= 4 || threes >= 4 || fours >= 4 || fives >= 4 || sixes >= 4) {
		if(playerArr[currentPlayer].scores["4kscore"]==-1) writeVal(score, "4kscore");
	}
	//check for small straight
	if(ones >= 1 && twos >= 1 && threes >= 1 && fours >= 1) {
		if(playerArr[currentPlayer].scores["SSscore"]==-1) writeVal(30, "SSscore");
	}
	else if(twos >= 1 && threes >= 1 && fours >= 1 && fives >= 1) {
		if(playerArr[currentPlayer].scores["SSscore"]==-1) writeVal(30, "SSscore");
	}
	else if(threes >= 1 && fours >= 1 && fives >= 1 && sixes >= 1) {
		if(playerArr[currentPlayer].scores["SSscore"]==-1) writeVal(30, "SSscore");
	}
	//check for large straight
	if((ones == 1 && twos == 1 && threes == 1 && fours == 1 && fives == 1) || (twos == 1 && threes == 1 && fours == 1 && fives == 1 && sixes == 1)) {
		if(playerArr[currentPlayer].scores["LSscore"]==-1) writeVal(40, "LSscore");
	}
	//display chance score
	if(playerArr[currentPlayer].scores["Cscore"]==-1) writeVal(score, "Cscore");

}//end rollScore

//function to write value to table
function writeVal(score, elementID){
	document.getElementById(elementID).innerHTML= score;
}

//click event to allow player to select a particular score
function saveScore(id, bID, bonus){
	var val = document.getElementById(id).innerHTML;

	if(val == null || val == "") val = 0;

	//can't pick a score until they've rolled at least once
	if(rollCount >= 1){
		document.getElementById("next").disabled = false; //enable the change turn button
		document.getElementById(bID).disabled = true;     //disable the option button
		document.getElementById('roll').disabled = true;	//disable the roll button

		//save the new score and button state
		playerArr[currentPlayer].scores[id]= val;
		playerArr[currentPlayer].buttons[bID]=false;
		playerArr[currentPlayer].scores["score"] += parseInt(val);

		//check if part of bonus. If so add it to the left total
		if(bonus){
			playerArr[currentPlayer].leftTotal += parseInt(val);
		}
		//check for bonus. If there, add it to the player's scorecard and score total
		if(playerArr[currentPlayer].leftTotal >= 63) {
			if(playerArr[currentPlayer].scores["Bscore"]==-1){
				 writeVal(35, "Bscore"); //show it on the scorecard
				 //save the bonus
				 playerArr[currentPlayer].scores["Bscore"]= 35;
				 playerArr[currentPlayer].scores["score"] += 35; //add the bonus to the score

			 }
		}

    //display the player's new score
    document.getElementById('score').innerHTML = (playerArr[currentPlayer].scores["score"]);
	}
}

//function to display the player's scorecard
function displayScore(scoreCard, buttonStates){
	var scores = new Array();

	//get the scores to display (ones whose value is not -1)
	for(var score in scoreCard){
		if(scoreCard[score] != -1){
			scores.push(score);
		}
	}

	//use the elements in scores to find the HTML tags to modify
	for(i=0; i < scores.length; i++){
		document.getElementById(scores[i]).innerHTML=(scoreCard[scores[i]]);
	}

	//get the buttons and determine whether or not they should be enabled
	var buttonsOnArr = new Array();
	var buttonsOffArr = new Array();
	//sort the buttons
	for(var button in buttonStates){
		if(buttonStates[button] == false){
			buttonsOffArr.push(button);
		}else buttonsOnArr.push(button);
	}

	for (i=0; i < buttonsOnArr.length; i++){
		document.getElementById(buttonsOnArr[i]).disabled=false;
	}
	for (i=0; i < buttonsOffArr.length; i++){
		document.getElementById(buttonsOffArr[i]).disabled=true;
	}

	//display the player's score
	document.getElementById('score').innerHTML = (playerArr[currentPlayer].scores["score"]);
}

//button handler function to display player's scores after game has finished
function display(btnID){
	currentPlayer = btnID;
	var scd = playerArr[btnID].scores;
	var btnst = playerArr[btnID].buttons;
	resetBoard();
	displayScore(scd, btnst);
}

//function to reset the board
function resetBoard(){
	document.getElementById("next").disabled = true;
	document.getElementById("rollCt").innerHTML="Roll: &nbsp";

	var elementsArr = document.getElementsByName('pScores'); //get all the board spaces

	for(i=0; i<elementsArr.length; i++){
		if(elementsArr[i].type!="button" && playerArr[currentPlayer].scores[elementsArr[i].id]==-1)
		{
			elementsArr[i].innerHTML="";
		}
	}
}

//function to reset the dice
function resetDice(){
	for(i=1; i<6; i++){
		document.getElementById("die"+i).src=("dice.png");
		diceArray[i-1]=0;
	}
	document.chkBx.reset();
}

//winner function
function findWinner(){
	var winner = 0;
	var winners = new Array();
	for (i=0; i< playerArr.length; i++){
		var playerScore = playerArr[i].scores['score'];
		var winningScore = playerArr[winner].scores['score'];
		if(playerScore > winningScore) winner = i;
	}
	//Check for tie score
	for (i=0; i< playerArr.length; i++){
		if(playerArr[i].scores['score'] == playerArr[winner].scores['score']){
			winners.push(i);
		}
		document.getElementById(i).hidden=false; //display the player buttons
	}
	//reset the board and dice then display the winner's name
	resetBoard(); resetDice();
	currentPlayer = winner;
	displayScore(playerArr[winner].scores, playerArr[winner].buttons);

	//display the winners' names
	for (i=0; i< winners.length; i++){
		document.getElementById("rnd").innerHTML+=(playerArr[winners[i]].pName + " Wins! ");
	}
}
