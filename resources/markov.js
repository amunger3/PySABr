function calcFreq() {
    valPA = valAB + valBB;
    valTOB = valH + valBB;
    val1B = valH - val2B - val3B - valHR;

    // create frequencies per PA for all variables
    freqOBP = valTOB / valPA * 1.0;
    freqBB = valBB / valPA * 1.0;
    freq1B = val1B / valPA * 1.0;
    freq2B = val2B / valPA * 1.0;
    freq3B = val3B / valPA * 1.0;
    freqHR = valHR / valPA * 1.0;
    freqSO = valSO / valPA * 1.0;
    freqOUT = 1.0 - freqOBP * 1.0;

    // calculate number of PA per 27-out game
    freqPA = freqOBP / freqOUT * 27.0 + 27.0;

    // percentage of non K outs to all outs
    rateNonK_OUT = 1 - freqSO / freqOUT;

    // SLG, BA
    rateSLG = (freq1B + 2 * freq2B + 3 * freq3B + 4 * freqHR) / (1 - freqBB);
    rateBA = (freq1B + freq2B + freq3B + freqHR) / (1 - freqBB);

}


function reEngine() {
    // chance of *not* scoring for each state
    // the variable name is of the form:
    // - state_bb_o_r, where
    // --- bb = base of the lead runner
    // --- o = number of outs
    // --- r = number of other runners on base
    //
    state_3b_2_2 = freqOUT;

    state_3b_2_1 = state_3b_2_2 * freqBB +
        freqOUT;

    state_3b_2_0 = state_3b_2_1 * freqBB +
        freqOUT;


    state_3b_1_2 = state_3b_2_2 * freqOUT * (1 - rateNonK_OUT * eventOUT_state3B_1);

    state_3b_1_1 = state_3b_1_2 * freqBB +
        state_3b_2_1 * freqOUT * (1 - rateNonK_OUT * eventOUT_state3B_1);

    state_3b_1_0 = state_3b_1_1 * freqBB +
        state_3b_2_0 * freqOUT * (1 - rateNonK_OUT * eventOUT_state3B_1);


    state_3b_0_2 = state_3b_1_2 * freqOUT * (1 - rateNonK_OUT * eventOUT_state3B_0);

    state_3b_0_1 = state_3b_0_2 * freqBB +
        state_3b_1_1 * freqOUT * (1 - rateNonK_OUT * eventOUT_state3B_0);

    state_3b_0_0 = state_3b_0_1 * freqBB +
        state_3b_1_0 * freqOUT * (1 - rateNonK_OUT * eventOUT_state3B_0);


    state_2b_2_1 = state_3b_2_2 * (freqBB + freq1B * (1 - event1B_state2B_2)) +
        freqOUT;

    state_2b_2_0 = state_2b_2_1 * freqBB +
        state_3b_2_1 * freq1B * (1 - event1B_state2B_2) +
        freqOUT;


    state_2b_1_1 = state_3b_1_2 * (freqBB + freq1B * (1 - event1B_state2B_1)) +
        state_3b_2_1 * freqOUT * rateNonK_OUT * eventOUT_state2B_1 +
        state_2b_2_1 * freqOUT * (1 - rateNonK_OUT * eventOUT_state2B_1);

    state_2b_1_0 = state_2b_1_1 * freqBB +
        state_3b_1_1 * freq1B * (1 - event1B_state2B_1) +
        state_3b_2_0 * freqOUT * rateNonK_OUT * eventOUT_state2B_1 +
        state_2b_2_0 * freqOUT * (1 - rateNonK_OUT * eventOUT_state2B_1);


    state_2b_0_1 = state_3b_0_2 * (freqBB + freq1B * (1 - event1B_state2B_0)) +
        state_3b_1_1 * freqOUT * rateNonK_OUT * eventOUT_state2B_0 +
        state_2b_1_1 * freqOUT * (1 - rateNonK_OUT * eventOUT_state2B_0);

    state_2b_0_0 = state_2b_0_1 * freqBB +
        state_3b_0_1 * freq1B * (1 - event1B_state2B_0) +
        state_3b_1_0 * freqOUT * rateNonK_OUT * eventOUT_state2B_0 +
        state_2b_1_0 * freqOUT * (1 - rateNonK_OUT * eventOUT_state2B_0);


    state_1b_2_0 = state_2b_2_1 * (freqBB + freq1B * (1 - event1B_state1B_2)) +
        state_3b_2_1 * (freq1B * (event1B_state1B_2) + freq2B * (1 - event2B_state1B_2)) +
        freqOUT;

    state_1b_1_0 = state_2b_1_1 * (freqBB + freq1B * (1 - event1B_state1B_1)) +
        state_3b_1_1 * (freq1B * (event1B_state1B_1) + freq2B * (1 - event2B_state1B_1)) +
        state_2b_2_0 * freqOUT * rateNonK_OUT * eventOUT_state1B_1 +
        state_1b_2_0 * freqOUT * (1 - rateNonK_OUT * eventOUT_state1B_1);

    state_1b_0_0 = state_2b_0_1 * (freqBB + freq1B * (1 - event1B_state1B_0)) +
        state_3b_0_1 * (freq1B * (event1B_state1B_0) + freq2B * (1 - event2B_state1B_0)) +
        state_2b_1_0 * freqOUT * rateNonK_OUT * eventOUT_state1B_0 +
        state_1b_1_0 * freqOUT * (1 - rateNonK_OUT * eventOUT_state1B_0);



    // chance of scoring from a triple, single, double
    //   The "_2" and "_1" extensions to each variable is required for the RE calculations
    //   and is too long to explain here.  In short, it's the number of outs in an inning
    chance3B_3 = 1 - (state_3b_2_0 + state_3b_1_0 + state_3b_0_0) / 3.0;
    chance2B_3 = 1 - (state_2b_2_0 + state_2b_1_0 + state_2b_0_0) / 3.0;
    chance1B_3 = 1 - (state_1b_2_0 + state_1b_1_0 + state_1b_0_0) / 3.0;

    chance3B_2 = 1 - (state_3b_2_0 + state_3b_1_0) / 2.0;
    chance2B_2 = 1 - (state_2b_2_0 + state_2b_1_0) / 2.0;
    chance1B_2 = 1 - (state_1b_2_0 + state_1b_1_0) / 2.0;

    chance3B_1 = 1 - (state_3b_2_0) / 1.0;
    chance2B_1 = 1 - (state_2b_2_0) / 1.0;
    chance1B_1 = 1 - (state_1b_2_0) / 1.0;

    // number of times a runner scores after getting on base from a HR, 3B, 2B, 1B, BB
    runsHR = freqHR;
    runs3B_3 = chance3B_3 * freq3B;
    runs2B_3 = chance2B_3 * freq2B;
    runs1B_3 = chance1B_3 * (freq1B + freqBB);

    runs3B_2 = chance3B_2 * freq3B;
    runs2B_2 = chance2B_2 * freq2B;
    runs1B_2 = chance1B_2 * (freq1B + freqBB);

    runs3B_1 = chance3B_1 * freq3B;
    runs2B_1 = chance2B_1 * freq2B;
    runs1B_1 = chance1B_1 * (freq1B + freqBB);

    // total number of runs scored in a game
    runsALL = (runsHR + runs3B_3 + runs2B_3 + runs1B_3) * freqPA;

    // the "bases empty" line for the Run Expectancy matrix, for 0, 1, 2 outs
    rpi_3 = (runsHR + runs3B_3 + runs2B_3 + runs1B_3) * freqPA / 9.0;
    rpi_2 = (runsHR + runs3B_2 + runs2B_2 + runs1B_2) * freqPA * 2.0 / 3.0 / 9.0;
    rpi_1 = (runsHR + runs3B_1 + runs2B_1 + runs1B_1) * freqPA * 1.0 / 3.0 / 9.0;

    // the rest of the run expectancy matrix
    RE_1xx_0 = (1 - state_1b_0_0) + rpi_3;
    RE_1xx_1 = (1 - state_1b_1_0) + rpi_2;
    RE_1xx_2 = (1 - state_1b_2_0) + rpi_1;
    RE_x2x_0 = (1 - state_2b_0_0) + rpi_3;
    RE_x2x_1 = (1 - state_2b_1_0) + rpi_2;
    RE_x2x_2 = (1 - state_2b_2_0) + rpi_1;
    RE_xx3_0 = (1 - state_3b_0_0) + rpi_3;
    RE_xx3_1 = (1 - state_3b_1_0) + rpi_2;
    RE_xx3_2 = (1 - state_3b_2_0) + rpi_1;
    RE_12x_0 = (1 - state_1b_0_0) + (1 - state_2b_0_1) + rpi_3;
    RE_12x_1 = (1 - state_1b_1_0) + (1 - state_2b_1_1) + rpi_2;
    RE_12x_2 = (1 - state_1b_2_0) + (1 - state_2b_2_1) + rpi_1;
    RE_1x3_0 = (1 - state_1b_0_0) + (1 - state_3b_0_1) + rpi_3;
    RE_1x3_1 = (1 - state_1b_1_0) + (1 - state_3b_1_1) + rpi_2;
    RE_1x3_2 = (1 - state_1b_2_0) + (1 - state_3b_2_1) + rpi_1;
    RE_x23_0 = (1 - state_2b_0_0) + (1 - state_3b_0_1) + rpi_3;
    RE_x23_1 = (1 - state_2b_1_0) + (1 - state_3b_1_1) + rpi_2;
    RE_x23_2 = (1 - state_2b_2_0) + (1 - state_3b_2_1) + rpi_1;
    RE_123_0 = (1 - state_1b_0_0) + (1 - state_2b_0_1) + (1 - state_3b_0_2) + rpi_3;
    RE_123_1 = (1 - state_1b_1_0) + (1 - state_2b_1_1) + (1 - state_3b_1_2) + rpi_2;
    RE_123_2 = (1 - state_1b_2_0) + (1 - state_2b_2_1) + (1 - state_3b_2_2) + rpi_1;

    // the "bases empty" line for the Run Frequency matrix, for 0, 1, 2 outs
    RF_xxx_2 = (freqHR + freq3B * (1 - state_3b_2_0) + freq2B * (1 - state_2b_2_0) + (freq1B + freqBB) * (1 - state_1b_2_0));
    RF_xxx_1 = (freqHR + freq3B * (1 - state_3b_1_0) + freq2B * (1 - state_2b_1_0) + (freq1B + freqBB) * (1 - state_1b_1_0)) + freqOUT * RF_xxx_2;
    RF_xxx_0 = (freqHR + freq3B * (1 - state_3b_0_0) + freq2B * (1 - state_2b_0_0) + (freq1B + freqBB) * (1 - state_1b_0_0)) + freqOUT * RF_xxx_1;

    // the rest of the run frequency matrix
    RF_1xx_0 = (1 - state_1b_0_0);
    RF_1xx_1 = (1 - state_1b_1_0);
    RF_1xx_2 = (1 - state_1b_2_0);
    RF_x2x_0 = (1 - state_2b_0_0);
    RF_x2x_1 = (1 - state_2b_1_0);
    RF_x2x_2 = (1 - state_2b_2_0);
    RF_xx3_0 = (1 - state_3b_0_0);
    RF_xx3_1 = (1 - state_3b_1_0);
    RF_xx3_2 = (1 - state_3b_2_0);
    RF_12x_0 = (1 - state_2b_0_1);
    RF_12x_1 = (1 - state_2b_1_1);
    RF_12x_2 = (1 - state_2b_2_1);
    RF_1x3_0 = (1 - state_3b_0_1);
    RF_1x3_1 = (1 - state_3b_1_1);
    RF_1x3_2 = (1 - state_3b_2_1);
    RF_x23_0 = (1 - state_3b_0_1);
    RF_x23_1 = (1 - state_3b_1_1);
    RF_x23_2 = (1 - state_3b_2_1);
    RF_123_0 = (1 - state_3b_0_2);
    RF_123_1 = (1 - state_3b_1_2);
    RF_123_2 = (1 - state_3b_2_2);

}

function calcEstimators() {
    // this is for fun.  I calculate BaseRuns and basic Runs Created
    valA = freqBB + freq1B + freq2B + freq3B;
    valB = .8 * freq1B + 2.0 * freq2B + 3.2 * freq3B + 1.8 * freqHR + .1 * freqBB;
    scoreRate = valB / (valB + freqOUT);
    BSR = (valA * scoreRate + freqHR) * freqPA;

    BJRC = freqOBP * (freq1B + 2 * freq2B + 3 * freq3B + 4 * freqHR) * freqPA;

}

function writeOutput() {
    document.writeln("<HTML><STYLE>th {	background-color: #CCCCCC;}</STYLE><BODY>");

    document.writeln("<BR><B>Assumptions</B><BR>NO runners out on base<BR>NO basestealing");

    document.writeln("<BR>&nbsp;<HR>");
    document.writeln("<BR>", runsALL.toFixed(3), " : <B>Runs Scored per Game</B>");
    document.writeln("<BR>&nbsp;");
    document.writeln("<BR>", BSR.toFixed(3), " : Estimated, Runs Scored per Game, BaseRuns");
    document.writeln("<BR>", BJRC.toFixed(3), " : Estimated, Runs Scored per Game, Bill James Runs Created");

    document.writeln("<BR>&nbsp;<HR>");
    document.writeln("<BR><B> AVG / OBP / SLG </B><BR>", rateBA.toFixed(3), " / ", freqOBP.toFixed(3), " / ", rateSLG.toFixed(3));

    document.writeln("<BR>&nbsp;<HR>");
    document.writeln("<BR><B>Chance of Scoring</B>");
    document.writeln("<BR>The chance of the runner eventually scoring, after getting on from a batting event, based on the number of outs when he reached base.");
    document.writeln("<BR><I>Note: This matches the corresponding lines in the Run Frequency Matrix. </I>");
    document.writeln("<BR>&nbsp;");
    document.writeln("<TABLE border=1 cellspacing=0 cellpadding=4>");
    document.writeln("<TR><TH>Event</TH><TH>0 outs</TH><TH>1 out</TH><TH>2 outs</TH><TH>AVERAGE</TH>");
    document.writeln("<TR><TH>1B/BB</TH><TD>", RF_1xx_0.toFixed(3), "</TD><TD>", RF_1xx_1.toFixed(3), "</TD><TD>", RF_1xx_2.toFixed(3), "</TD><TD>", chance1B_3.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>Double</TH><TD>", RF_x2x_0.toFixed(3), "</TD><TD>", RF_x2x_1.toFixed(3), "</TD><TD>", RF_x2x_2.toFixed(3), "</TD><TD>", chance2B_3.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>Triple</TH><TD>", RF_xx3_0.toFixed(3), "</TD><TD>", RF_xx3_1.toFixed(3), "</TD><TD>", RF_xx3_2.toFixed(3), "</TD><TD>", chance3B_3.toFixed(3), "</TD></TR>");
    document.writeln("</TABLE>");

    document.writeln("<BR>&nbsp;<HR>");
    document.writeln("<BR><B>Run Expectancy Matrix</B>");
    document.writeln("<BR>The average number of runs, from this base/out state, to the end of the inning.");
    document.writeln("<BR>&nbsp;");
    document.writeln("<TABLE border=1 cellspacing=0 cellpadding=4>");
    document.writeln("<TR><TH>Bases</TH><TH>0 outs</TH><TH>1 out</TH><TH>2 outs</TH>");
    document.writeln("<TR><TH>xxx</TH><TD>", rpi_3.toFixed(3), "</TD><TD>", rpi_2.toFixed(3), "</TD><TD>", rpi_1.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>1xx</TH><TD>", RE_1xx_0.toFixed(3), "</TD><TD>", RE_1xx_1.toFixed(3), "</TD><TD>", RE_1xx_2.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>x2x</TH><TD>", RE_x2x_0.toFixed(3), "</TD><TD>", RE_x2x_1.toFixed(3), "</TD><TD>", RE_x2x_2.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>xx3</TH><TD>", RE_xx3_0.toFixed(3), "</TD><TD>", RE_xx3_1.toFixed(3), "</TD><TD>", RE_xx3_2.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>12x</TH><TD>", RE_12x_0.toFixed(3), "</TD><TD>", RE_12x_1.toFixed(3), "</TD><TD>", RE_12x_2.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>1x3</TH><TD>", RE_1x3_0.toFixed(3), "</TD><TD>", RE_1x3_1.toFixed(3), "</TD><TD>", RE_1x3_2.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>x23</TH><TD>", RE_x23_0.toFixed(3), "</TD><TD>", RE_x23_1.toFixed(3), "</TD><TD>", RE_x23_2.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>123</TH><TD>", RE_123_0.toFixed(3), "</TD><TD>", RE_123_1.toFixed(3), "</TD><TD>", RE_123_2.toFixed(3), "</TD></TR>");
    document.writeln("</TABLE>");

    document.writeln("<BR>&nbsp;<HR>");
    document.writeln("<BR><B>Run Frequency Matrix</B>");
    document.writeln("<BR>The chance of at least one run scoring, from this base/out state, at some point during the inning.");
    document.writeln("<BR>-- If there is a runner on base, it's the chance that the lead runner will eventually score in the inning.");
    document.writeln("<BR>-- If there is no runner on base, it's the chance that someone will reach base and score, at some point during the inning.");
    document.writeln("<BR>&nbsp;");
    document.writeln("<TABLE border=1 cellspacing=0 cellpadding=4>");
    document.writeln("<TR><TH>Bases</TH><TH>0 outs</TH><TH>1 out</TH><TH>2 outs</TH>");
    document.writeln("<TR><TH>xxx</TH><TD>", RF_xxx_0.toFixed(3), "</TD><TD>", RF_xxx_1.toFixed(3), "</TD><TD>", RF_xxx_2.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>1xx</TH><TD>", RF_1xx_0.toFixed(3), "</TD><TD>", RF_1xx_1.toFixed(3), "</TD><TD>", RF_1xx_2.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>x2x</TH><TD>", RF_x2x_0.toFixed(3), "</TD><TD>", RF_x2x_1.toFixed(3), "</TD><TD>", RF_x2x_2.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>xx3</TH><TD>", RF_xx3_0.toFixed(3), "</TD><TD>", RF_xx3_1.toFixed(3), "</TD><TD>", RF_xx3_2.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>12x</TH><TD>", RF_12x_0.toFixed(3), "</TD><TD>", RF_12x_1.toFixed(3), "</TD><TD>", RF_12x_2.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>1x3</TH><TD>", RF_1x3_0.toFixed(3), "</TD><TD>", RF_1x3_1.toFixed(3), "</TD><TD>", RF_1x3_2.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>x23</TH><TD>", RF_x23_0.toFixed(3), "</TD><TD>", RF_x23_1.toFixed(3), "</TD><TD>", RF_x23_2.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>123</TH><TD>", RF_123_0.toFixed(3), "</TD><TD>", RF_123_1.toFixed(3), "</TD><TD>", RF_123_2.toFixed(3), "</TD></TR>");
    document.writeln("</TABLE>");


}

function writeLWTS() {

    document.writeln("<BR>&nbsp;<HR>");
    document.writeln("<BR><B>Marginal Run Values by Event</B>, i.e. Linear Weights ");
    document.writeln("<BR>The number of additional runs scored if one more of a particular event occurred (according to the various models).  That is, if a team was able to hit one more single in the game in this ", runsALL.toFixed(1), " runs per game environment, this team would score ", lwts1B.toFixed(3), " more runs.");
    document.writeln("<BR><I>Note: It's not exactly 1 more, since that'll change the run environment.  We're looking at the rate of change as we approach adding zero.  For all intents and purposes, treat it as adding one to the run environment.</I>");
    document.writeln("<BR>&nbsp;");
    document.writeln("<TABLE border=1 cellspacing=0 cellpadding=4>");
    document.writeln("<TR><TH>Event</TH><TH>Markov</TH><TH>BaseRuns</TH><TH>Runs Created</TH>");
    document.writeln("<TR><TH>Walk</TH><TD>", lwtsBB.toFixed(3), "</TD><TD>", bsrBB.toFixed(3), "</TD><TD>", bjrcBB.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>Single</TH><TD>", lwts1B.toFixed(3), "</TD><TD>", bsr1B.toFixed(3), "</TD><TD>", bjrc1B.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>Double</TH><TD>", lwts2B.toFixed(3), "</TD><TD>", bsr2B.toFixed(3), "</TD><TD>", bjrc2B.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>Triple</TH><TD>", lwts3B.toFixed(3), "</TD><TD>", bsr3B.toFixed(3), "</TD><TD>", bjrc3B.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>Homerun</TH><TD>", lwtsHR.toFixed(3), "</TD><TD>", bsrHR.toFixed(3), "</TD><TD>", bjrcHR.toFixed(3), "</TD></TR>");
    document.writeln("<TR><TH>Out, sans K</TH><TD>", lwtsOUT.toFixed(3), "</TD><TD>&nbsp;</TD><TD>&nbsp;</TD></TR>");
    document.writeln("<TR><TH>Strikeout</TH><TD>", (lwtsOUT + lwtsSO).toFixed(3), "</TD><TD>&nbsp;</TD><TD>&nbsp;</TD></TR>");
    document.writeln("</TABLE>");
    document.writeln("<P> = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ");
    document.writeln("<P>The run values below are what you would use if you wanted to create a <I>Runs Created</I>-type calculation.  <UL><LI>Linear Weights shows the run values relative to the existing context, and therefore, is a zero-sum game.  <LI>Runs Created shows the absolute number of runs created.</UL>");
    document.writeln("", rcOUT.toFixed(3), " : Runs Created OUT, excludes strikeouts");
    document.writeln("<BR>", (rcOUT + lwtsSO).toFixed(3), " : Runs Created SO");
    document.writeln("<BR>&nbsp;<HR>");

    document.writeln("</BODY></HTML>");

}

function calcRuns(theForm) {
    // transfers the values from the form to variables
    valAB = theForm.inAB.value * 1.0;
    valH = theForm.inH.value * 1.0;
    val2B = theForm.in2B.value * 1.0;
    val3B = theForm.in3B.value * 1.0;
    valHR = theForm.inHR.value * 1.0;
    valBB = theForm.inBB.value * 1.0;
    valSO = theForm.inSO.value * 1.0;

    event1B_state1B_0 = theForm.in_event1B_state1B_0.value;
    event1B_state1B_1 = theForm.in_event1B_state1B_1.value;
    event1B_state1B_2 = theForm.in_event1B_state1B_2.value;
    event1B_state2B_0 = theForm.in_event1B_state2B_0.value;
    event1B_state2B_1 = theForm.in_event1B_state2B_1.value;
    event1B_state2B_2 = theForm.in_event1B_state2B_2.value;
    event2B_state1B_0 = theForm.in_event2B_state1B_0.value;
    event2B_state1B_1 = theForm.in_event2B_state1B_1.value;
    event2B_state1B_2 = theForm.in_event2B_state1B_2.value;
    eventOUT_state1B_0 = theForm.in_eventOUT_state1B_0.value;
    eventOUT_state1B_1 = theForm.in_eventOUT_state1B_1.value;
    eventOUT_state1B_2 = theForm.in_eventOUT_state1B_2.value;
    eventOUT_state2B_0 = theForm.in_eventOUT_state2B_0.value;
    eventOUT_state2B_1 = theForm.in_eventOUT_state2B_1.value;
    eventOUT_state2B_2 = theForm.in_eventOUT_state2B_2.value;
    eventOUT_state3B_0 = theForm.in_eventOUT_state3B_0.value;
    eventOUT_state3B_1 = theForm.in_eventOUT_state3B_1.value;
    eventOUT_state3B_2 = theForm.in_eventOUT_state3B_2.value;


    // processing data to determine
    // - runs scored per game
    // - run expectancy matrix
    calcFreq();
    reEngine();
    calcEstimators();
    writeOutput();

    // calculate LWTS
    baselineR = runsALL;
    baselinePA = freqPA;
    baselineBSR = BSR;
    baselineBJRC = BJRC;
    pebble = freqPA / 100.0;

    valBB = valBB + pebble;
    calcFreq();
    reEngine();
    calcEstimators();
    lwtsBB = ((runsALL - baselineR) / (freqPA - baselinePA));
    bsrBB = ((BSR - baselineBSR) / (freqPA - baselinePA));
    bjrcBB = ((BJRC - baselineBJRC) / (freqPA - baselinePA));
    valBB = valBB - pebble;

    valAB = valAB + pebble;
    valH = valH + pebble;
    calcFreq();
    reEngine();
    calcEstimators();
    lwts1B = ((runsALL - baselineR) / (freqPA - baselinePA));
    bjrc1B = ((BJRC - baselineBJRC) / (freqPA - baselinePA));
    bsr1B = ((BSR - baselineBSR) / (freqPA - baselinePA));

    val2B = val2B + pebble;
    calcFreq();
    reEngine();
    calcEstimators();
    lwts2B = ((runsALL - baselineR) / (freqPA - baselinePA));
    bsr2B = ((BSR - baselineBSR) / (freqPA - baselinePA));
    bjrc2B = ((BJRC - baselineBJRC) / (freqPA - baselinePA));
    val2B = val2B - pebble;

    val3B = val3B + pebble;
    calcFreq();
    reEngine();
    calcEstimators();
    lwts3B = ((runsALL - baselineR) / (freqPA - baselinePA));
    bsr3B = ((BSR - baselineBSR) / (freqPA - baselinePA));
    bjrc3B = ((BJRC - baselineBJRC) / (freqPA - baselinePA));
    val3B = val3B - pebble;

    valHR = valHR + pebble;
    calcFreq();
    reEngine();
    calcEstimators();
    lwtsHR = ((runsALL - baselineR) / (freqPA - baselinePA));
    bsrHR = ((BSR - baselineBSR) / (freqPA - baselinePA));
    bjrcHR = ((BJRC - baselineBJRC) / (freqPA - baselinePA));
    valHR = valHR - pebble;
    valH = valH - pebble;
    valAB = valAB - pebble;

    valSO = valSO + pebble;
    calcFreq();
    reEngine();
    calcEstimators();
    lwtsSO = (runsALL - baselineR) / pebble;
    valSO = valSO - pebble;

    lwtsOUT = -(freqBB * lwtsBB +
        freq1B * lwts1B +
        freq2B * lwts2B +
        freq3B * lwts3B +
        freqHR * lwtsHR +
        freqSO * lwtsSO
    ) / freqOUT;

    rcOUT = lwtsOUT + runsALL / 27;

    writeLWTS();


}