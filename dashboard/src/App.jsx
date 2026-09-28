import React, { useState, useEffect, useRef } from 'react';
import nlp from 'compromise';
import AnuvaadStream from './AnuvaadStream';
import AnuvaadVideo from './AnuvaadVideo';
import { 
  Activity, 
  Volume2, 
  Mic, 
  MicOff, 
  HelpCircle, 
  Settings, 
  Plus, 
  BookOpen, 
  Video, 
  VideoOff, 
  Play, 
  Pause, 
  RotateCcw,
  Speech, 
  Trash2, 
  Layers,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu
} from 'lucide-react';
import SYNONYMS from './synonyms';



function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}



const SIGN_DESCRIPTIONS = {
  ISL: {
    A: "Touch the index tip of your dominant hand to the thumb tip of your non-dominant hand.",
    B: "Connect both hands by touching the thumbs and index fingers together, forming two closed circles resembling a 'B'.",
    C: "Curve your dominant hand's index and thumb to form a C shape, and place it against your flat non-dominant hand.",
    D: "Point your non-dominant index finger straight up. Touch your dominant index tip to its tip, and dominant thumb to its base.",
    E: "Touch the index tip of your dominant hand to the index tip of your non-dominant hand.",
    F: "Cross the index and middle fingers of your dominant hand over the index and middle fingers of your non-dominant hand.",
    G: "Place both fists on top of each other, dominant on top of non-dominant.",
    H: "Flat hands. Place the palm of your dominant hand flat across the fingers of your non-dominant hand.",
    I: "Touch the index tip of your dominant hand to the middle tip of your non-dominant hand.",
    J: "Draw a hook shape on the palm of your non-dominant hand using your dominant index finger.",
    K: "Place your dominant index finger against the side of your non-dominant index finger.",
    L: "Place your dominant index finger flat across the palm of your non-dominant hand.",
    M: "Place the index, middle, and ring fingers of your dominant hand flat onto the palm of your non-dominant hand.",
    N: "Place the index and middle fingers of your dominant hand flat onto the palm of your non-dominant hand.",
    O: "Touch the index tip of your dominant hand to the ring finger tip of your non-dominant hand.",
    P: "Form a circle with your dominant index and thumb, and touch it to the tip of your non-dominant index finger.",
    Q: "Hook your dominant index finger around the base of your non-dominant index finger.",
    R: "Curl your dominant index finger and place it flat on the palm of your non-dominant hand.",
    S: "Hook your dominant pinky finger around your non-dominant pinky finger.",
    T: "Touch the index tip of your dominant hand to the base of your non-dominant pinky finger.",
    U: "Touch the index tip of your dominant hand to the pinky tip of your non-dominant hand.",
    V: "Form a 'V' shape with your dominant index and middle fingers, and place them onto your non-dominant palm.",
    W: "Interlace the fingers of both hands, facing each other.",
    X: "Cross your dominant index finger horizontally over your non-dominant index finger.",
    Y: "Place your dominant index finger in the web between the thumb and index finger of your non-dominant hand.",
    Z: "Draw a 'Z' in the palm of your non-dominant hand with your dominant index finger.",
    "1": "Extend your dominant hand's index finger straight up. Fold other fingers.",
    "2": "Extend your dominant hand's index and middle fingers. Fold other fingers.",
    "3": "Extend your dominant hand's index, middle, and ring fingers. Fold other fingers.",
    "4": "Extend your dominant hand's index, middle, ring, and pinky fingers. Fold your thumb.",
    "5": "Extend all five fingers of your dominant hand.",
    "6": "Extend your dominant hand's thumb and pinky finger straight out, folding the index, middle, and ring fingers to form a Shaka sign.",
    "7": "Extend your dominant hand's thumb and index finger to form an 'L' shape, with other fingers folded.",
    "8": "Extend your dominant hand's thumb, index, and middle fingers, keeping the ring and pinky fingers folded.",
    "9": "Make a tight fist with your dominant hand, keeping all fingers folded.",
    "10": "Extend only your dominant hand's thumb straight up, keeping other fingers folded to form a thumbs-up sign.",
    "HELLO": "Extend your dominant hand flat, fingers together, and wave/salute outwards from your temple (Salute gesture).",
    "HI": "Extend your dominant hand flat, fingers together, and wave/salute outwards from your temple (Salute gesture).",
    "HOW ARE YOU": "Extend the thumbs of both hands straight up (Thumbs-up gesture) and hold them side-by-side pointing slightly forward.",
    "THANK YOU": "Place the flat palm of your dominant hand against your chin/lips, then move it forward and down towards the other person.",
    "PLEASE": "Place the flat palm of your dominant hand against your chest and move it in a circular motion.",
    "GOODBYE" : "Raise your dominant hand, fingers slightly curved, and wave it side-to-side (Curved wave gesture).",
    "BYE": "Raise your dominant hand, fingers slightly curved, and wave it side-to-side (Curved wave gesture).",
    "YES": "Form a fist with your dominant hand and nod it up and down at the wrist (Fist gesture).",
    "NO": "Extend your dominant hand's index and middle fingers, then snap them down quickly to touch your thumb.",
    "LOVE": "Extend the thumb, index finger, and pinky finger of your dominant hand while folding the middle and ring fingers (ILY handshape).",
    "I LOVE YOU": "Extend the thumb, index finger, and pinky finger of your dominant hand while folding the middle and ring fingers (ILY handshape).",
    "ILY": "Extend the thumb, index finger, and pinky finger of your dominant hand while folding the middle and ring fingers (ILY handshape).",
    "GOOD MORNING": "Form a thumbs-up with your dominant hand and sweep it in a wide arc across your body from left to right (Thumbs-up sweep gesture).",
    "GOOD AFTERNOON": "Touch your forehead with the index and middle fingers of your dominant hand, then move them forward and down (Two-finger forward gesture).",
    "HOW HAVE YOU BEEN": "Extend both hands forward with your index fingers pointing outward, moving them slightly towards each other in a questioning motion.",
    "IS THIS ALL RIGHT": "Form the 'OK' sign with your dominant hand (touching index and thumb tips to form a circle, other fingers extended) and raise it slightly.",
    "I REALLY DONT LIKE THIS": "Form a thumbs-down with your dominant hand and make a slight pushing-away motion with your palm facing down.",
    "I LOVE THIS": "Place both flat hands crossed over your chest/heart, with fingers spread wide (Heart overlay gesture).",
    "CONFESSION": "Hold both hands open in front of your chest with palms facing up, then move them outwards and slightly down to reveal/share.",
    "EMERGENCY": "Hold one hand up and wave it quickly side-to-side in a flashing or alert signal (Alert wave gesture).",
    "WHY": "Extend your dominant hand's index and middle fingers, moving them in a brief circular motion to query 'why'.",
    "DON'T": "Extend the index and middle fingers of your dominant hand and shake them side-to-side in a wagging/dismissing motion.",
    "DONT": "Extend the index and middle fingers of your dominant hand and shake them side-to-side in a wagging/dismissing motion.",
    "WEIRD": "Raise your dominant hand with fingers slightly curved and wave them in front of your chest (Curved wiggle gesture).",
    "CRAZY": "Point your dominant index finger to your temple and move it in small circles (Temple circle gesture).",
    "LUNATIC": "Point your dominant index finger to your temple and move it in small circles (Temple circle gesture).",
    "THIS": "Point your dominant index finger straight down towards the ground (Pointing down gesture).",
    "MANY": "Extend both hands with fingers spread wide, wiggling them slightly to indicate quantity.",
    "GREAT": "Extend the thumbs of both hands straight up (Double thumbs-up gesture) and hold them side-by-side pointing slightly forward.",
    "AND MANY MORE": "Extend both hands flat, palms facing up, and sweep them outward in a welcoming circle.",
    "SORRY": "Make a fist with your dominant hand and rotate it in a circular motion over your chest (Chest circle gesture).",
    "HAPPY": "Place your flat dominant hand on your chest and brush it upward in quick, light strokes.",
    "SAD": "Bring one or both hands, fingers slightly curved, down slowly in front of your face with a downward sweep.",
    "HUNGRY": "Form a 'C' shape with your dominant hand and slide it down the center of your chest.",
    "WATER": "Form a 'W' handshape (index, middle, ring fingers extended, thumb and pinky touching) and tap your index tip to your chin.",
    "HELP": "Place your dominant hand flat, palm facing up, and place your closed non-dominant hand thumbs-up on top of it, lifting them together.",
    "MY": "Place the flat palm of your dominant hand flat against your chest (Self/my gesture).",
    "NAME": "Extend the index and middle fingers of both hands, and cross/tap them together (Name gesture).",
    "APPLAUSE": "Clap both hands together repeatedly to show applause and praise (Clapping gesture).",
    "SURPRISE": "Raise both hands open, palms facing outward, with fingers spread to show joy and surprise (Surprise gesture).",
    "VICTORY": "Form a 'V' shape (peace sign) with the index and middle fingers of your dominant hand (Victory sign).",
    "GRATITUDE": "Press both palms together in front of your chest (Prayer/gratitude gesture).",
    "HEART": "Form a heart shape using both hands (Heart hands gesture).",
    "WRITE": "Mime writing on a flat palm with your dominant hand holding an imaginary pen (Writing gesture).",
    "HANDSHAKE": "Mime clasping and shaking another person's hand (Handshake gesture).",
    "STRENGTH": "Flex your dominant arm's bicep to indicate strength and power (Strength gesture).",
    "HUG": "Cross both arms in front of you with hands facing inward, miming a hug (Hug gesture).",
    "CALL ME": "Extend the thumb and pinky finger of your dominant hand while folding other fingers, and place it near your ear (Call me gesture).",
    "POINTING UP": "Point your dominant index finger straight up (Pointing up gesture).",
    "RECEIVING": "Hold your dominant hand flat with the palm facing up, fingers slightly curved (Receiving gesture).",
    "GIVE": "Mime picking something up with your dominant hand, fingers curved downward (Giving/choosing gesture).",
    "GOOD LUCK": "Cross your dominant hand's index and middle fingers (Good luck/cross fingers gesture).",
    "OK": "Form a circle with your dominant index finger and thumb, keeping other fingers extended (OK sign).",
    "PROSPER": "Form the Vulcan salute by spreading your index/middle and ring/pinky fingers apart (Prosper salute).",
    "YOU": "Point your dominant index finger straight forward at the camera or person (Pointing forward gesture).",
    "PINCH": "Pinch your dominant thumb and index finger tips together (Pinch gesture).",
    "FINGER HEART": "Cross your dominant thumb and index finger to form a miniature heart shape (Finger heart gesture).",
    "POINTING LEFT": "Point your dominant index finger to the left side (Pointing left gesture).",
    "POINTING RIGHT": "Point your dominant index finger to the right side (Pointing right gesture).",
    "POINTING DOWN": "Point your dominant index finger straight down (Pointing down gesture).",
    "STOP": "Place the flat dominant hand palm-down, chopping down onto the flat palm of the non-dominant hand (Stop gesture).",
    "PAIN": "Point the index fingers of both hands towards each other and move them together and apart repeatedly (Pain gesture).",
    "EAT": "Form a flattened 'O' shape with your dominant hand and bring it to your mouth (Eating gesture).",
    "DRINK": "Form a curved shape with your dominant hand as if holding a cup, and bring it to your mouth (Drinking gesture).",
    "MORE": "Bring both flattened 'O' hands together, touching the fingertips repeatedly (More gesture).",
    "BATHROOM": "Form a fist with your dominant hand and shake it side-to-side (Bathroom alert gesture).",
    "HOW": "Place both curved hands together with fingers bent, then roll them outwards to face palms-up (How gesture).",
    "WHAT": "Hold both hands in front of you with palms facing up, wiggling/shaking them slightly side-to-side (What gesture).",
    "WHERE": "Hold your dominant index finger up and shake it side-to-side (Where gesture).",
    "WHEN": "Hold your non-dominant index finger up, and circle your dominant index finger around it, touching the tip (When gesture).",
    "HI HELLO": "Extend your dominant hand and wave it in a greeting motion (Hi/hello gesture).",
    "LOVE YOU": "Extend the thumb, index, and pinky finger of your dominant hand to sign 'I love you' (ILY salute).",
    "JOY SURPRISE": "Raise both hands open, palms facing outward, with fingers spread in a joyful/surprise expression.",
    "HEART HANDS": "Form a heart shape using the thumbs and fingers of both hands (Heart hands gesture).",
    "HI STOP": "Extend your dominant hand flat, palm facing forward, to gesture 'stop' or 'hi' (Stop gesture).",
    "WRITING HAND": "Mime writing on your flat non-dominant palm with your dominant hand holding an imaginary pen.",
    "PRAYING HANDS": "Press the palms of both hands flat together in a classic praying/thanks pose.",
    "ROCK ON": "Extend the index and pinky fingers of your dominant hand while folding the middle and ring fingers.",
    "THUMBS UP": "Extend your dominant hand's thumb straight up, folding all other fingers (Thumbs-up gesture).",
    "THUMBS DOWN": "Point your dominant hand's thumb straight down, folding all other fingers (Thumbs-down gesture).",
    "PICKING UP": "Mime picking up an object with your dominant hand, fingers curved downward (Picking up gesture).",
    "RAISED HAND": "Raise your dominant hand flat with palm facing forward, fingers together (Raised hand gesture).",
    "GREET FIGHT": "Form a fist with your dominant hand and thrust it forward/left in a greeting/fight stance.",
    "GREET SUPPORT": "Form a fist with your dominant hand and thrust it forward/right in a greeting/support stance.",
    "OK HAND": "Form a circle with your dominant thumb and index finger, keeping other fingers extended (OK sign).",
    "AGREEMENT LEFT": "Extend your dominant hand, pointing the palm leftwards in a sliding agreement motion.",
    "AGREEMENT RIGHT": "Extend your dominant hand, pointing the palm rightwards in a sliding agreement motion.",
    "WISH TO PROSPER": "Form the Vulcan salute by spreading your index/middle and ring/pinky fingers apart (Prosper salute).",
    "AGREE STOP": "Place your flat dominant hand palm-down to signal agreement or stop.",
    "LOVE HOPE": "Cross your dominant thumb and index finger to form a miniature heart shape (Finger heart gesture).",
    "SMALL AMOUNT": "Pinch your dominant thumb and index finger slightly apart to indicate a small quantity.",
    "GREETINGS": "Hold your dominant hand in a loose fist facing forward to greet someone (Greetings gesture).",
    "HATE INSULT": "Extend the middle finger of your dominant hand upwards (Hate/insult gesture).",
    "WELCOME": "Extend both hands forward, palms facing up, and bring them slightly back toward your body in a welcoming motion.",
    "TOILET": "Form a 'T' handshape with your dominant hand and shake it side-to-side near your shoulder.",
    "SIT": "Extend the index and middle fingers of both hands, placing the dominant hand's fingers flat on top of the non-dominant hand's fingers.",
    "SHOW ME": "Place the index finger of your dominant hand onto the open palm of your non-dominant hand, and move them forward together.",
    "QUESTION": "Draw a question mark shape in the air with your dominant index finger, then tap below it.",
    "PEACE": "Extend the index and middle fingers of both hands to form 'V' shapes, moving them slightly outward with palms facing forward.",
    "OPEN": "Place both flat hands side-by-side with palms facing down, then turn them outwards so the palms face up and apart.",
    "MY NAME IS": "Place your flat dominant palm on your chest (My), then tap the index and middle fingers of both hands crossed (Name).",
    "MOM": "Tap the side of your dominant index finger onto the side of your non-dominant index finger twice (traditional ISL mother representation).",
    "LESS": "Place both flat hands horizontal, palm facing palm, and move them closer together vertically to indicate a smaller amount.",
    "GO": "Point your dominant index finger forward and sweep it outward in a clear directing motion.",
    "DISAGREE": "Place the index fingers of both hands together, then pull them apart horizontally while turning them away.",
    "DAD": "Tap the index and middle fingers of your dominant hand onto your non-dominant hand's palm twice (traditional ISL father representation).",
    "CLEAN": "Place the flat palm of your dominant hand onto the palm of your non-dominant hand and brush it forward smoothly.",
    "CLAP": "Strike the palms of both hands flat together repeatedly in a clapping motion.",
    "ALL DONE": "Place both hands flat with palms facing up, then turn them over quickly to face palms down and move them slightly outward.",
    "AGREE": "Place your flat dominant palm on top of your non-dominant palm in a firm, overlapping clap gesture.",
    "ACCEPT": "Hold both hands open, palms facing up, and pull them back toward your chest while closing them into soft fists.",
    "SMOKE": "Bring the index and middle fingers of your dominant hand (formed in a V shape) to your lips, then move them away."
  }
};



function drawProceduralLetter(ctx, letter, signLang) {

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  

  const fingerBases = {
    thumb: { x: 0.20, y: 0.70 },
    index: { x: letter === 'U' ? 0.44 : (letter === 'V' ? 0.38 : 0.35), y: 0.58 },
    middle: { x: letter === 'U' ? 0.48 : (letter === 'V' ? 0.52 : 0.50), y: 0.55 },
    ring: { x: 0.65, y: 0.58 },
    pinky: { x: 0.80, y: 0.62 }
  };

  const getHandJoints = (states, isRightHand) => {
    const wrist = { x: 0.5, y: 0.90 };
    const joints = [wrist]; // 0: wrist


    const addFingerJoints = (base, state) => {
      let pip, dip, tip;
      
      if (state === 'up') {
        pip = { x: base.x, y: base.y - 0.16 };
        dip = { x: base.x, y: base.y - 0.30 };
        tip = { x: base.x, y: base.y - 0.42 };
      } else if (state === 'down') {

        pip = { x: base.x, y: base.y + 0.08 };
        dip = { x: base.x - 0.01, y: base.y + 0.16 };
        tip = { x: base.x - 0.02, y: base.y + 0.22 };
      } else if (state === 'out') {
        pip = { x: base.x + 0.10, y: base.y - 0.02 };
        dip = { x: base.x + 0.18, y: base.y - 0.04 };
        tip = { x: base.x + 0.25, y: base.y - 0.05 };
      } else if (state === 'horizontal') {
        pip = { x: base.x + 0.08, y: base.y - 0.04 };
        dip = { x: base.x + 0.15, y: base.y - 0.07 };
        tip = { x: base.x + 0.21, y: base.y - 0.09 };
      } else { // curved

        pip = { x: base.x - 0.07, y: base.y - 0.05 };
        dip = { x: base.x - 0.10, y: base.y - 0.14 };
        tip = { x: base.x - 0.04, y: base.y - 0.20 };
      }
      joints.push(base, pip, dip, tip);
    };


    let tPip, tDip, tTip;
    const tBase = fingerBases.thumb;
    if (states.thumb === 'out') {
      tPip = { x: tBase.x - 0.08, y: tBase.y - 0.03 };
      tDip = { x: tBase.x - 0.16, y: tBase.y - 0.06 };
      tTip = { x: tBase.x - 0.22, y: tBase.y - 0.08 };
    } else if (states.thumb === 'in') {
      tPip = { x: tBase.x + 0.06, y: tBase.y + 0.02 };
      tDip = { x: tBase.x + 0.11, y: tBase.y + 0.03 };
      tTip = { x: tBase.x + 0.15, y: tBase.y + 0.04 };
    } else { // up
      tPip = { x: tBase.x - 0.02, y: tBase.y - 0.08 };
      tDip = { x: tBase.x - 0.04, y: tBase.y - 0.15 };
      tTip = { x: tBase.x - 0.05, y: tBase.y - 0.22 };
    }
    joints.push(tBase, tPip, tDip, tTip); // 1, 2, 3, 4: thumb


    addFingerJoints(fingerBases.index, states.index); // 5,6,7,8: index
    addFingerJoints(fingerBases.middle, states.middle); // 9,10,11,12: middle
    addFingerJoints(fingerBases.ring, states.ring); // 13,14,15,16: ring
    addFingerJoints(fingerBases.pinky, states.pinky); // 17,18,19,20: pinky


    if (letter === 'G' || letter === 'H' || letter === 'POINTING LEFT') {
      joints.forEach((j, idx) => {
        if (idx > 0) {
          const dx = j.x - 0.5;
          const dy = j.y - 0.7; // Rotate around palm center
          j.x = 0.5 + dy;
          j.y = 0.7 - dx;
        }
      });
    }


    if (letter === 'POINTING RIGHT') {
      joints.forEach((j, idx) => {
        if (idx > 0) {
          const dx = j.x - 0.5;
          const dy = j.y - 0.7;
          j.x = 0.5 - dy;
          j.y = 0.7 + dx;
        }
      });
    }


    if (letter === 'P' || letter === 'Q' || letter === 'THIS' || letter === 'POINTING DOWN' || letter === 'THUMBS DOWN') {
      joints.forEach((j, idx) => {
        if (idx > 0) {
          const dx = j.x - 0.5;
          const dy = j.y - 0.7; // Rotate around palm center
          j.x = 0.5 - dx;
          j.y = 0.7 - dy;
        }
      });
    }


    if (!isRightHand) {
      joints.forEach(j => {
        j.x = 1.0 - j.x;
      });
    }

    return joints;
  };

  const drawJointsOnCanvas = (joints) => {

    const margin = ctx.canvas.width * 0.08;
    const drawW = ctx.canvas.width - 2 * margin;
    const drawH = ctx.canvas.height - 2 * margin;
    const scaleFactor = ctx.canvas.width / 100;

    const scaledPts = joints.map(pt => ({
      x: margin + pt.x * drawW,
      y: margin + pt.y * drawH
    }));

    const fingers = [
      { joints: [0, 1, 2, 3, 4], width: 5.5 * scaleFactor },
      { joints: [0, 5, 6, 7, 8], width: 4.8 * scaleFactor },
      { joints: [0, 9, 10, 11, 12], width: 4.8 * scaleFactor },
      { joints: [0, 13, 14, 15, 16], width: 4.5 * scaleFactor },
      { joints: [0, 17, 18, 19, 20], width: 4.0 * scaleFactor }
    ];

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';


    ctx.strokeStyle = '#000000';
    

    ctx.beginPath();
    ctx.moveTo(scaledPts[0].x, scaledPts[0].y);
    ctx.lineTo(scaledPts[1].x, scaledPts[1].y);
    ctx.lineTo(scaledPts[5].x, scaledPts[5].y);
    ctx.lineTo(scaledPts[9].x, scaledPts[9].y);
    ctx.lineTo(scaledPts[13].x, scaledPts[13].y);
    ctx.lineTo(scaledPts[17].x, scaledPts[17].y);
    ctx.closePath();
    ctx.lineWidth = 14 * scaleFactor;
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.fill();


    fingers.forEach(f => {
      ctx.lineWidth = f.width + 3.2 * scaleFactor;
      ctx.beginPath();
      ctx.moveTo(scaledPts[f.joints[0]].x, scaledPts[f.joints[0]].y);
      for (let i = 1; i < f.joints.length; i++) {
        ctx.lineTo(scaledPts[f.joints[i]].x, scaledPts[f.joints[i]].y);
      }
      ctx.stroke();
    });


    ctx.strokeStyle = '#fdc57a';


    ctx.beginPath();
    ctx.moveTo(scaledPts[0].x, scaledPts[0].y);
    ctx.lineTo(scaledPts[1].x, scaledPts[1].y);
    ctx.lineTo(scaledPts[5].x, scaledPts[5].y);
    ctx.lineTo(scaledPts[9].x, scaledPts[9].y);
    ctx.lineTo(scaledPts[13].x, scaledPts[13].y);
    ctx.lineTo(scaledPts[17].x, scaledPts[17].y);
    ctx.closePath();
    ctx.fillStyle = '#fdc57a';
    ctx.fill();


    fingers.forEach(f => {
      ctx.lineWidth = f.width;
      ctx.beginPath();
      ctx.moveTo(scaledPts[f.joints[0]].x, scaledPts[f.joints[0]].y);
      for (let i = 1; i < f.joints.length; i++) {
        ctx.lineTo(scaledPts[f.joints[i]].x, scaledPts[f.joints[i]].y);
      }
      ctx.stroke();
    });


    scaledPts.forEach((pt, idx) => {
      const isTip = [4, 8, 12, 16, 20].includes(idx);
      if (isTip) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.0 * scaleFactor, 0, 2 * Math.PI);
        ctx.fillStyle = '#000000';
        ctx.fill();
      }
    });


    const wristPt = scaledPts[0];
    const cuffW = 34 * scaleFactor;
    const cuffH = 14 * scaleFactor;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(wristPt.x - cuffW/2, wristPt.y - 2 * scaleFactor, cuffW, cuffH, 4 * scaleFactor);
    } else {
      ctx.rect(wristPt.x - cuffW/2, wristPt.y - 2 * scaleFactor, cuffW, cuffH);
    }
    ctx.fill();

    ctx.fillStyle = '#00abf0';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(wristPt.x - cuffW/2 + 2.5 * scaleFactor, wristPt.y + 0.5 * scaleFactor, cuffW - 5 * scaleFactor, cuffH - 5 * scaleFactor, 2.5 * scaleFactor);
    } else {
      ctx.rect(wristPt.x - cuffW/2 + 2.5 * scaleFactor, wristPt.y + 0.5 * scaleFactor, cuffW - 5 * scaleFactor, cuffH - 5 * scaleFactor);
    }
    ctx.fill();

    ctx.restore();
  };



    let leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    let rightStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };


    if (letter === 'HI' || letter === 'HELLO') {
      rightStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'HOW ARE YOU') {
      rightStates = { thumb: 'out', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'out', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'THANK YOU') {
      rightStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'PLEASE') {
      rightStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'GOODBYE' || letter === 'BYE') {
      rightStates = { thumb: 'out', index: 'curved', middle: 'curved', ring: 'curved', pinky: 'curved' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'YES') {
      rightStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'NO') {
      rightStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'LOVE' || letter === 'I LOVE YOU' || letter === 'ILY') {
      rightStates = { thumb: 'out', index: 'up', middle: 'down', ring: 'down', pinky: 'up' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'GOOD MORNING') {
      rightStates = { thumb: 'out', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'GOOD AFTERNOON') {
      rightStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'HOW HAVE YOU BEEN') {
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'IS THIS ALL RIGHT') {
      rightStates = { thumb: 'curved', index: 'curved', middle: 'up', ring: 'up', pinky: 'up' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'I REALLY DONT LIKE THIS') {
      rightStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'I LOVE THIS') {
      rightStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      leftStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
    } else if (letter === 'CONFESSION') {
      rightStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
    } else if (letter === 'EMERGENCY') {
      rightStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'WHY') {
      rightStates = { thumb: 'out', index: 'up', middle: 'curved', ring: 'curved', pinky: 'curved' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'DONT' || letter === 'DON\'T' || letter === 'CRAZY' || letter === 'LUNATIC' || letter === 'THIS') {
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'WATER') {
      rightStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'up', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'WEIRD' || letter === 'MANY' || letter === 'AND MANY MORE' || letter === 'HAPPY') {
      rightStates = { thumb: 'out', index: 'curved', middle: 'curved', ring: 'curved', pinky: 'curved' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'GREAT') {
      rightStates = { thumb: 'out', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'out', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'HELP') {
      rightStates = { thumb: 'out', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
    } else if (letter === 'SORRY' || letter === 'SAD' || letter === 'HUNGRY' || letter === 'BATHROOM') {
      rightStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'MY NAME IS' || letter === 'STOP' || letter === 'MORE' || letter === 'WHAT' || letter === 'HOW') {
      rightStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
    } else if (letter === 'PAIN' || letter === 'WHEN') {
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'EAT' || letter === 'DRINK') {
      rightStates = { thumb: 'out', index: 'curved', middle: 'curved', ring: 'curved', pinky: 'curved' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'WHERE') {
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'LOVE YOU') {
      rightStates = { thumb: 'out', index: 'up', middle: 'down', ring: 'down', pinky: 'up' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'MY' || letter === 'APPLAUSE' || letter === 'SURPRISE' || letter === 'GRATITUDE' || letter === 'HEART' || letter === 'HANDSHAKE' || letter === 'HUG' || letter === 'HI HELLO' || letter === 'JOY SURPRISE' || letter === 'HEART HANDS' || letter === 'HI STOP' || letter === 'PRAYING HANDS' || letter === 'RAISED HAND' || letter === 'AGREEMENT LEFT' || letter === 'AGREEMENT RIGHT' || letter === 'AGREE STOP') {
      rightStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
    } else if (letter === 'NAME' || letter === 'VICTORY' || letter === 'GOOD LUCK' || letter === 'OK' || letter === 'PROSPER' || letter === 'FINGER HEART' || letter === 'ROCK ON' || letter === 'OK HAND' || letter === 'WISH TO PROSPER' || letter === 'LOVE HOPE') {
      rightStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'down', pinky: 'down' };
    } else if (letter === 'WRITE' || letter === 'STRENGTH' || letter === 'PINCH' || letter === 'CALL ME' || letter === 'RECEIVING' || letter === 'GIVE' || letter === 'WRITING HAND' || letter === 'PICKING UP' || letter === 'SMALL AMOUNT') {
      rightStates = { thumb: 'out', index: 'curved', middle: 'curved', ring: 'curved', pinky: 'curved' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'POINTING UP' || letter === 'POINTING LEFT' || letter === 'POINTING RIGHT' || letter === 'POINTING DOWN' || letter === 'YOU' || letter === 'HATE INSULT') {
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'THUMBS UP' || letter === 'THUMBS DOWN' || letter === 'GREET FIGHT' || letter === 'GREET SUPPORT' || letter === 'GREETINGS') {
      rightStates = { thumb: 'out', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'MY' || letter === 'APPLAUSE' || letter === 'SURPRISE' || letter === 'GRATITUDE' || letter === 'HEART' || letter === 'HANDSHAKE' || letter === 'HUG') {
      rightStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
    } else if (letter === 'NAME' || letter === 'VICTORY' || letter === 'GOOD LUCK' || letter === 'OK' || letter === 'PROSPER' || letter === 'FINGER HEART') {
      rightStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'down', pinky: 'down' };
    } else if (letter === 'WRITE' || letter === 'STRENGTH' || letter === 'PINCH' || letter === 'CALL ME' || letter === 'RECEIVING' || letter === 'GIVE') {
      rightStates = { thumb: 'out', index: 'curved', middle: 'curved', ring: 'curved', pinky: 'curved' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'POINTING UP' || letter === 'POINTING LEFT' || letter === 'POINTING RIGHT' || letter === 'POINTING DOWN' || letter === 'YOU') {
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === '1') {
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === '2') {
      rightStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'down', pinky: 'down' };
    } else if (letter === '3') {
      rightStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'up', pinky: 'down' };
    } else if (letter === '4') {
      rightStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
    } else if (letter === '5') {
      rightStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
    } else if (letter === '6') {
      rightStates = { thumb: 'out', index: 'down', middle: 'down', ring: 'down', pinky: 'out' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === '7') {
      rightStates = { thumb: 'out', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === '8') {
      rightStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === '9') {
      rightStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === '10') {
      rightStates = { thumb: 'out', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'A') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'B') {
      leftStates = { thumb: 'curved', index: 'curved', middle: 'curved', ring: 'curved', pinky: 'curved' };
      rightStates = { thumb: 'curved', index: 'curved', middle: 'curved', ring: 'curved', pinky: 'curved' };
    } else if (letter === 'C') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'curved', index: 'curved', middle: 'curved', ring: 'curved', pinky: 'curved' };
    } else if (letter === 'D') {
      leftStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
      rightStates = { thumb: 'curved', index: 'curved', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'E') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'F') {
      leftStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'down', pinky: 'down' };
      rightStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'down', pinky: 'down' };
    } else if (letter === 'G') {
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
      rightStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'H') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
    } else if (letter === 'I') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'J') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'K') {
      leftStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'L') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'M') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'up', pinky: 'down' };
    } else if (letter === 'N') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'down', pinky: 'down' };
    } else if (letter === 'O') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'P') {
      leftStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
      rightStates = { thumb: 'curved', index: 'curved', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'Q') {
      leftStates = { thumb: 'curved', index: 'curved', middle: 'down', ring: 'down', pinky: 'down' };
      rightStates = { thumb: 'in', index: 'curved', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'R') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'in', index: 'curved', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'S') {
      leftStates = { thumb: 'in', index: 'down', middle: 'down', ring: 'down', pinky: 'up' };
      rightStates = { thumb: 'in', index: 'curved', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'T') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'U') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'V') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'in', index: 'up', middle: 'up', ring: 'down', pinky: 'down' };
    } else if (letter === 'W') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
    } else if (letter === 'X') {
      leftStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'Y') {
      leftStates = { thumb: 'out', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
    } else if (letter === 'Z') {
      leftStates = { thumb: 'out', index: 'up', middle: 'up', ring: 'up', pinky: 'up' };
      rightStates = { thumb: 'in', index: 'up', middle: 'down', ring: 'down', pinky: 'down' };
    }

    const offset = ctx.canvas.width * 0.15;

    ctx.save();
    ctx.translate(-offset, 0);
    const leftJoints = getHandJoints(leftStates, false);
    drawJointsOnCanvas(leftJoints);
    ctx.restore();

    ctx.save();
    ctx.translate(offset, 0);
    const rightJoints = getHandJoints(rightStates, true);
    drawJointsOnCanvas(rightJoints);
    ctx.restore();
}


function SignBridgeLogo({ size = 20 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ display: 'block' }}
    >

      <path d="M2 19C6 11 18 11 22 19" />

      <path d="M12 21V13M12 13C12 11.5 13.5 10.5 13.5 9.5V5C13.5 4 12.5 3 11.5 3C10.5 3 9.5 4 9.5 5V13" />
      <path d="M7.5 14.5c0-1 1-2 2-2" />
      <path d="M14.5 12.5c1 0 2 1 2 2" />
    </svg>
  );
}


function LetterCanvas({ letter, signLang, width = 200, height = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawProceduralLetter(ctx, letter, signLang);
  }, [letter, signLang]);

  return (
    <canvas 
      ref={canvasRef} 
      className="guide-canvas"
      width={width}
      height={height}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}


function DictionaryImage({ item, signLang, className = "card-image", width = 160, height = 160, customDict = [] }) {
  const [pathIndex, setPathIndex] = useState(0);


  useEffect(() => {
    setPathIndex(0);
  }, [item]);

  if (!item) return null;

  const cleanItem = item.trim();
  const lookupKey = cleanItem.toLowerCase();
  const upperItem = cleanItem.toUpperCase();


  const customMatch = Array.isArray(customDict) && customDict.find(d => d.label === upperItem);
  if (customMatch) {
    return (
      <img
        src={customMatch.image}
        alt={`Sign for ${item}`}
        className={className}
        style={{ width: `${width}px`, height: `${height}px`, objectFit: 'contain', display: 'block', margin: '0 auto' }}
      />
    );
  }


  if (SYNONYMS && Array.isArray(customDict)) {
    for (const [key, list] of Object.entries(SYNONYMS)) {
      const keyMatch = key.toLowerCase() === lookupKey;
      const listMatch = Array.isArray(list) && list.some(val => typeof val === 'string' && val.toLowerCase() === lookupKey);

      if (keyMatch || listMatch) {

        const customKeyMatch = customDict.find(d => d.label === key.toUpperCase());
        if (customKeyMatch) {
          return (
            <img
              src={customKeyMatch.image}
              alt={`Sign for ${item}`}
              className={className}
              style={{ width: `${width}px`, height: `${height}px`, objectFit: 'contain', display: 'block', margin: '0 auto' }}
            />
          );
        }
        

        if (Array.isArray(list)) {
          for (const val of list) {
            const customValMatch = customDict.find(d => d.label === val.toUpperCase());
            if (customValMatch) {
              return (
                <img
                  src={customValMatch.image}
                  alt={`Sign for ${item}`}
                  className={className}
                  style={{ width: `${width}px`, height: `${height}px`, objectFit: 'contain', display: 'block', margin: '0 auto' }}
                />
              );
            }
          }
        }
      }
    }
  }



  const candidateWords = new Set();
  candidateWords.add(cleanItem);
  candidateWords.add(cleanItem.toLowerCase());
  candidateWords.add(cleanItem.toUpperCase());


  if (SYNONYMS) {
    for (const [key, list] of Object.entries(SYNONYMS)) {
      const keyMatch = key.toLowerCase() === lookupKey;
      const listMatch = Array.isArray(list) && list.some(val => typeof val === 'string' && val.toLowerCase() === lookupKey);

      if (keyMatch || listMatch) {

        candidateWords.add(key);
        candidateWords.add(key.toLowerCase());
        candidateWords.add(key.toUpperCase());
        

        if (Array.isArray(list)) {
          for (const val of list) {
            if (typeof val === 'string') {
              candidateWords.add(val);
              candidateWords.add(val.toLowerCase());
              candidateWords.add(val.toUpperCase());
            }
          }
        }
      }
    }
  }


  const EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];


  const paths = [];
  for (const word of candidateWords) {
    const wordSafe = encodeURIComponent(word);
    for (const ext of EXTENSIONS) {
      paths.push(`/images/isl/${wordSafe}${ext}`);
    }
  }


  for (const word of candidateWords) {
    const wordSafe = encodeURIComponent(word);
    for (const ext of EXTENSIONS) {
      paths.push(`/images/${wordSafe}${ext}`);
    }
  }


  if (pathIndex >= paths.length) {
    return null;
  }

  const imgSrc = paths[pathIndex];

  return (
    <img
      src={imgSrc}
      alt={`Sign for ${item}`}
      className={className}
      style={{ width: `${width}px`, height: `${height}px`, objectFit: 'contain', display: 'block', margin: '0 auto' }}
      onError={() => setPathIndex(prev => prev + 1)}
    />
  );
}



let globalHands = null;
let globalHandsPromise = null;

export default function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('signbridge_authenticated') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [userEmail, setUserEmail] = useState(() => {
    try {
      return localStorage.getItem('signbridge_user_email') || 'shreya.shetty@example.com';
    } catch (e) {
      return 'shreya.shetty@example.com';
    }
  });
  const [userFullName, setUserFullName] = useState(() => {
    try {
      return localStorage.getItem('signbridge_user_fullname') || '';
    } catch (e) {
      return '';
    }
  });
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot_password', 'verify_otp', 'reset_password'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerErrors, setRegisterErrors] = useState({});
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetErrors, setResetErrors] = useState({});
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [dashboardLookupWord, setDashboardLookupWord] = useState('');


  const [customDictionary, setCustomDictionary] = useState(() => {
    try {
      const saved = localStorage.getItem('signbridge_custom_dictionary');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [newDictLabel, setNewDictLabel] = useState('');
  const [newDictImage, setNewDictImage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addCustomDictionaryItem = (label, base64Image) => {
    const cleanLabel = label.trim().toUpperCase();
    if (!cleanLabel || !base64Image) return;
    
    setCustomDictionary(prev => {
      const filtered = prev.filter(item => item.label !== cleanLabel);
      const next = [...filtered, { label: cleanLabel, image: base64Image }];
      try {
        localStorage.setItem('signbridge_custom_dictionary', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const deleteCustomDictionaryItem = (label) => {
    setCustomDictionary(prev => {
      const next = prev.filter(item => item.label !== label);
      try {
        localStorage.setItem('signbridge_custom_dictionary', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewDictImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddDictItem = (e) => {
    e.preventDefault();
    if (!newDictLabel.trim() || !newDictImage) return;
    addCustomDictionaryItem(newDictLabel, newDictImage);
    setNewDictLabel('');
    setNewDictImage('');
    setShowAddForm(false);
  };

  const getDisplayName = () => {
    if (userFullName) return userFullName;
    if (!userEmail) return "Guest User";
    const namePart = userEmail.split('@')[0];
    const cleanName = namePart.replace(/[._-]/g, ' ');
    return cleanName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getInitials = (name) => {
    if (!name) return "GU";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!loginEmail) errors.email = "Email address is required.";
    if (!loginPassword) errors.password = "Password is required.";

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await response.json();
      
      if (response.ok) {
        setLoginErrors({});
        setIsAuthenticated(true);
        setUserEmail(loginEmail);
        setUserFullName(data.fullName || '');
        localStorage.setItem('signbridge_authenticated', 'true');
        localStorage.setItem('signbridge_user_email', loginEmail);
        if (data.fullName) localStorage.setItem('signbridge_user_fullname', data.fullName);
      } else {
        setLoginErrors({ email: data.error || "Invalid email or password." });
      }
    } catch (e) {
      setLoginErrors({ email: "Network error occurred during login." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return '';
    if (pwd.length < 6) return 'Weak';
    const hasNum = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    if (pwd.length >= 8 && hasNum && hasSpecial) return 'Strong';
    if (pwd.length >= 6 && hasNum) return 'Strong';
    return 'Weak';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!registerFullName) errors.fullName = "Full Name is required.";
    if (!registerEmail) {
      errors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(registerEmail)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!registerPassword) errors.password = "Password is required.";
    if (registerPassword !== registerConfirmPassword) errors.confirmPassword = "Passwords do not match.";

    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: registerFullName, email: registerEmail, password: registerPassword })
      });
      const data = await response.json();

      if (response.ok) {
        setRegisterErrors({});
        

        setRegisterFullName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterConfirmPassword('');
        

        setAuthMode('login');
      } else {
        setRegisterErrors({ email: data.error || "Registration failed." });
      }
    } catch (e) {
      setRegisterErrors({ email: "Network error occurred during registration." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetErrors({ email: "Email is required." });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { error: text || `Server error: ${response.status}` };
      }

      if (response.ok) {
        setResetSuccessMsg(data.message || 'OTP sent successfully. Please check your email.');
        setResetErrors({});
        setTimeout(() => {
          setResetSuccessMsg('');
          setAuthMode('verify_otp');
        }, 2000);
      } else {
        setResetErrors({ email: data.error || 'An error occurred. Please try again.' });
      }
    } catch (e) {
      console.error("Forgot password error:", e);
      setResetErrors({ email: "Unable to connect to the server. Please check your internet connection or try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!resetOtp) {
      setResetErrors({ otp: "OTP is required." });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp })
      });
      const data = await response.json();
      if (response.ok) {
        setResetSuccessMsg(data.message);
        setResetErrors({});
        setTimeout(() => {
          setResetSuccessMsg('');
          setAuthMode('reset_password');
        }, 1500);
      } else {
        setResetErrors({ otp: data.error });
      }
    } catch (e) {
      setResetErrors({ otp: "Network error." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!resetNewPassword) errors.newPassword = "Password is required.";
    if (resetNewPassword !== resetConfirmPassword) errors.confirmPassword = "Passwords do not match.";
    
    if (Object.keys(errors).length > 0) {
      setResetErrors(errors);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp, newPassword: resetNewPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setResetSuccessMsg(data.message);
        setResetErrors({});
        setTimeout(() => {
          setResetSuccessMsg('');
          setAuthMode('login');
          setResetEmail('');
          setResetOtp('');
          setResetNewPassword('');
          setResetConfirmPassword('');
        }, 2000);
      } else {
        setResetErrors({ newPassword: data.error });
      }
    } catch (e) {
      setResetErrors({ newPassword: "Network error." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthMode('login');
    

    setLoginEmail('');
    setLoginPassword('');
    setRegisterFullName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
    setResetEmail('');
    setResetOtp('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    
    try {
      localStorage.removeItem('signbridge_authenticated');
      localStorage.removeItem('signbridge_user_email');
      localStorage.removeItem('signbridge_user_fullname');
    } catch (e) {}
  };


  const [activeTab, setActiveTab] = useState('dashboard');
  const [signLang, setSignLang] = useState('ISL');
  const [isCapturing, setIsCapturing] = useState(false);
  const lastAppendedLabelRef = useRef(null);
  const [maximizedSign, setMaximizedSign] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [speakMode, setSpeakMode] = useState('combined');

  const getCombinedText = (historyItems) => {
    const chronological = historyItems.map(h => h.text).reverse();
    let result = [];
    let currentWord = '';
    chronological.forEach(char => {
      if (char.length === 1 && char !== ' ') {
        currentWord += char;
      } else {
        if (currentWord) {
          result.push(currentWord);
          currentWord = '';
        }
        if (char !== ' ') {
          result.push(char);
        }
      }
    });
    if (currentWord) {
      result.push(currentWord);
    }
    return result.join(" ");
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) return true;
    try {
      return localStorage.getItem('signbridge_sidebar_collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('signbridge_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (window.innerWidth <= 1024) {
      setIsSidebarCollapsed(true);
    }
  };


  const staticDictionaryItems = [
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    ..."1 2 3 4 5 6 7 8 9 10".split(" "),
    ...[
      "ACCEPT", "AGREE", "ALL DONE", "BYE", "CALL ME", "CLAP", "CLEAN", "DAD",
      "DISAGREE", "DRINK", "EAT", "GO", "GOOD LUCK", "GRATITUDE", "HANDSHAKE",
      "HELP", "HOW", "I LOVE YOU", "LESS", "LOVE", "MOM", "MORE", "MOVE",
      "MY", "MY NAME IS", "NAME", "NO", "OPEN", "PAIN", "PEACE", "PLEASE",
      "QUESTION", "SHOW ME", "SIT", "SORRY", "STOP", "THANK YOU", "TOILET",
      "WATER", "WELCOME", "WHAT", "WHEN", "WHERE", "YES"
    ]
  ];

  const dictionaryItems = Array.from(new Set([
    ...staticDictionaryItems,
    ...customDictionary.map(c => c.label)
  ]));


  useEffect(() => {
    if (!maximizedSign) return;

    const handleKeyDown = (e) => {
      const currentIndex = dictionaryItems.indexOf(maximizedSign);
      if (currentIndex === -1) return;

      if (e.key === 'ArrowLeft') {
        const prevIndex = (currentIndex - 1 + dictionaryItems.length) % dictionaryItems.length;
        setMaximizedSign(dictionaryItems[prevIndex]);
      } else if (e.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % dictionaryItems.length;
        setMaximizedSign(dictionaryItems[nextIndex]);
      } else if (e.key === 'Escape') {
        setMaximizedSign(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [maximizedSign]);


  const [dataset, setDataset] = useState([]);
  const [customGestures, setCustomGestures] = useState(() => {
    try {
      const saved = localStorage.getItem('signbridge_custom_gestures');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading custom gestures:", e);
      return [];
    }
  });


  useEffect(() => {
    try {
      localStorage.setItem('signbridge_custom_gestures', JSON.stringify(customGestures));
    } catch (e) {
      console.error("Error saving custom gestures:", e);
    }
  }, [customGestures]);
  const [prediction, setPrediction] = useState('No Sign Detected');
  const [gestureSequence, setGestureSequence] = useState([]);
  const [nlpSentence, setNlpSentence] = useState('');
  const [lastPredictionTime, setLastPredictionTime] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [translationHistory, setTranslationHistory] = useState([]);
  const [autoSpeak, setAutoSpeak] = useState(false);


  const [textToTranslate, setTextToTranslate] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1500);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaybackIndex, setCurrentPlaybackIndex] = useState(-1);
  const [playbackText, setPlaybackText] = useState([]);


  const [newGestureName, setNewGestureName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordedFrames, setRecordedFrames] = useState([]);


  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const avatarCanvasRef = useRef(null);
  const activeStreamRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const handsModelRef = useRef(null);
  const predictionBufferRef = useRef([]);
  const lastSpokenRef = useRef('');
  const stabilityCountRef = useRef(0);
  const stabilityLabelRef = useRef(null);
  const playbackIntervalRef = useRef(null);
  const trajectoryBufferRef = useRef([]);
  const lastUIUpdateRef = useRef(0);

  const handleHandResultsRef = useRef(null);


  useEffect(() => {
    handleHandResultsRef.current = handleHandResults;
  });


  useEffect(() => {

    fetch('/pretrained_dataset.json')
      .then(res => res.json())
      .then(data => {
        setDataset(data);
        console.log(`Loaded ${data.length} pretrained samples.`);
      })
      .catch(err => console.error("Error loading pretrained dataset:", err));

    const initHands = async () => {
      if (globalHands) {
        handsModelRef.current = globalHands;
        setIsModelReady(true);
        return;
      }

      if (globalHandsPromise) {
        const hands = await globalHandsPromise;
        handsModelRef.current = hands;
        setIsModelReady(true);
        return;
      }

      if (window.Hands) {
        console.log("Pre-initializing MediaPipe Hands WASM model...");
        globalHandsPromise = new Promise((resolve) => {
          const hands = new window.Hands({
            locateFile: (file) => `/mediapipe/${file}`
          });

          hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });

          hands.onResults((results) => {
            setIsModelReady(true);
            if (handleHandResultsRef.current) {
              handleHandResultsRef.current(results);
            }
          });


          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = 1;
          tempCanvas.height = 1;
          hands.send({ image: tempCanvas })
            .then(() => {
              setIsModelReady(true);
              console.log("MediaPipe WASM model pre-warmed successfully!");
              globalHands = hands;
              resolve(hands);
            })
            .catch(err => {
              console.warn("MediaPipe WASM pre-warming failed, resolving anyway:", err);
              globalHands = hands;
              resolve(hands);
            });
        });

        const hands = await globalHandsPromise;
        handsModelRef.current = hands;
      } else {
        console.error("MediaPipe Hands script was not loaded. Check script injection.");
      }
    };

    initHands();

    return () => {
      stopCamera();
      window.speechSynthesis.cancel();
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, []);

  const activeDataset = [...dataset, ...customGestures];


  useEffect(() => {
    let timer = null;
    if (activeTab === 'sign-to-speech' || activeTab === 'gesture-studio') {
      timer = setTimeout(() => {
        startCamera();
      }, 100);
    } else {
      stopCamera();
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [activeTab]);


  const speakText = (text) => {
    if (!text || text === 'No Sign Detected' || text === '?') return;
    try {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }, 50);
    } catch (e) {
      console.error("TTS speaking error:", e);
    }
  };


  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsDictating(true);
    };

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setTextToTranslate(prev => (prev + ' ' + resultText).trim());
    };

    recognition.onerror = (err) => {
      console.error("Speech recognition error:", err.error, err);
      setIsDictating(false);
      if (err.error === 'not-allowed') {
        alert("Microphone Access Error: Please click the site settings lock icon in your browser address bar and allow microphone permissions.");
      } else if (err.error === 'network') {
        alert("Speech Recognition Network Error: chrome speech engines require an active internet connection to transcribe speech.");
      }
    };

    recognition.onend = () => {
      setIsDictating(false);
    };

    recognition.start();
  };


  const startCamera = async () => {
    if (isCameraActive) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn("Video auto-play blocked or failed:", e));
        videoRef.current.onloadedmetadata = () => {
          setIsCameraActive(true);
          startFrameProcessing();
        };
      }
      activeStreamRef.current = stream;
    } catch (err) {
      console.error("Webcam streaming failed:", err);
      alert("Camera Access Blocked: Make sure your camera is connected, not locked by another application (like Teams, Zoom, or Python), and browser camera access is allowed.");
    }
  };


  const startFrameProcessing = () => {
    const process = async () => {
      if (!activeStreamRef.current || !videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        return;
      }
      
      if (videoRef.current.readyState === 4 && handsModelRef.current) {
        try {
          await handsModelRef.current.send({ image: videoRef.current });
        } catch (e) {
          console.error("MediaPipe processing error:", e);
        }
      }
      animationFrameIdRef.current = requestAnimationFrame(process);
    };
    animationFrameIdRef.current = requestAnimationFrame(process);
  };


  const stopCamera = () => {
    setIsCameraActive(false);
    setPrediction('No Sign Detected');
    setConfidence(0);

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => track.stop());
      activeStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };


  const drawAdvancedHand = (ctx, landmarks, isRightHand) => {
    const xList = landmarks.map(lm => lm.x * ctx.canvas.width);
    const yList = landmarks.map(lm => lm.y * ctx.canvas.height);
    const minX = Math.min(...xList) - 15;
    const maxX = Math.max(...xList) + 15;
    const minY = Math.min(...yList) - 15;
    const maxY = Math.max(...yList) + 15;
    
    ctx.save();
    ctx.strokeStyle = isRightHand ? '#5c6bc0' : '#8e24aa';
    ctx.lineWidth = 2.5;
    const len = 15;
    

    ctx.beginPath(); ctx.moveTo(minX + len, minY); ctx.lineTo(minX, minY); ctx.lineTo(minX, minY + len); ctx.stroke();

    ctx.beginPath(); ctx.moveTo(maxX - len, minY); ctx.lineTo(maxX, minY); ctx.lineTo(maxX, minY + len); ctx.stroke();

    ctx.beginPath(); ctx.moveTo(minX + len, maxY); ctx.lineTo(minX, maxY); ctx.lineTo(minX, maxY - len); ctx.stroke();

    ctx.beginPath(); ctx.moveTo(maxX - len, maxY); ctx.lineTo(maxX, maxY); ctx.lineTo(maxX, maxY - len); ctx.stroke();
    
    ctx.fillStyle = isRightHand ? '#5c6bc0' : '#8e24aa';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`${isRightHand ? 'Right Hand' : 'Left Hand'}`, minX + 4, minY - 6);
    ctx.restore();

    const fingers = [
      { name: 'thumb', joints: [0, 1, 2, 3, 4], color: '#ffd6a5', width: 4.5 },
      { name: 'index', joints: [0, 5, 6, 7, 8], color: '#9aa5e4', width: 4.0 },
      { name: 'middle', joints: [0, 9, 10, 11, 12], color: '#e2afff', width: 4.0 },
      { name: 'ring', joints: [0, 13, 14, 15, 16], color: '#ffb3c6', width: 3.5 },
      { name: 'pinky', joints: [0, 17, 18, 19, 20], color: '#cbd5e1', width: 3.0 }
    ];

    const palm = [5, 9, 13, 17];
    
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineWidth = 4.0;
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(landmarks[5].x * ctx.canvas.width, landmarks[5].y * ctx.canvas.height);
    for (let i = 1; i < palm.length; i++) {
      ctx.lineTo(landmarks[palm[i]].x * ctx.canvas.width, landmarks[palm[i]].y * ctx.canvas.height);
    }
    ctx.stroke();

    fingers.forEach(f => {
      ctx.lineWidth = f.width;
      ctx.strokeStyle = f.color;
      ctx.beginPath();
      ctx.moveTo(landmarks[f.joints[0]].x * ctx.canvas.width, landmarks[f.joints[0]].y * ctx.canvas.height);
      for (let i = 1; i < f.joints.length; i++) {
        ctx.lineTo(landmarks[f.joints[i]].x * ctx.canvas.width, landmarks[f.joints[i]].y * ctx.canvas.height);
      }
      ctx.stroke();
    });

    landmarks.forEach((pt, idx) => {
      let size = 4.5;
      if (idx === 0) size = 7;
      else if ([4, 8, 12, 16, 20].includes(idx)) size = 5.5;

      let dotColor = '#ffffff';
      if (idx >= 1 && idx <= 4) dotColor = '#ffd6a5';
      else if (idx >= 5 && idx <= 8) dotColor = '#9aa5e4';
      else if (idx >= 9 && idx <= 12) dotColor = '#e2afff';
      else if (idx >= 13 && idx <= 16) dotColor = '#ffb3c6';
      else if (idx >= 17 && idx <= 20) dotColor = '#c1fba4';
      else dotColor = '#cbd5e1';

      ctx.beginPath();
      ctx.arc(pt.x * ctx.canvas.width, pt.y * ctx.canvas.height, size, 0, 2 * Math.PI);
      ctx.fillStyle = dotColor;
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  };


  const getNormalizedLandmarks = (handLandmarks) => {
    let vw = 640;
    let vh = 480;
    if (videoRef.current && videoRef.current.videoWidth) {
      vw = videoRef.current.videoWidth;
      vh = videoRef.current.videoHeight;
    }



    const adjustedLandmarks = handLandmarks.map(lm => {
      return {
        x: lm.x,
        y: lm.y * (vh / vw) * (4 / 3),
        z: lm.z
      };
    });

    const xList = adjustedLandmarks.map(lm => lm.x);
    const yList = adjustedLandmarks.map(lm => lm.y);

    const minX = Math.min(...xList);
    const minY = Math.min(...yList);
    const maxX = Math.max(...xList);
    const maxY = Math.max(...yList);

    const scale = Math.max(maxX - minX, maxY - minY, 0.0001);

    const features = [];
    adjustedLandmarks.forEach(lm => {
      features.push((lm.x - minX) / scale);
      features.push((lm.y - minY) / scale);
    });

    return { features, scale, minX, minY };
  };


  const predictKNN = (inputFeatures, k = 7) => {
    if (activeDataset.length === 0) return { label: '?', confidence: 0 };

    let maxX1 = 0, maxX2 = 0;
    for (let i = 0; i < 42 && i < inputFeatures.length; i += 2) {
      if (inputFeatures[i] > maxX1) maxX1 = inputFeatures[i];
    }
    if (inputFeatures.length > 42) {
      for (let i = 42; i < 84 && i < inputFeatures.length; i += 2) {
        if (inputFeatures[i] > maxX2) maxX2 = inputFeatures[i];
      }
    }

    const mirroredFeatures = inputFeatures.map((val, idx) => {

      if (val === 0.0 && inputFeatures[idx - (idx % 2)] === 0.0) return val;
      if (idx % 2 === 0) {
        return (idx < 42 ? maxX1 : maxX2) - val;
      }
      return val;
    });


    let swappedFeatures = [...inputFeatures];
    let swappedMirrored = [...mirroredFeatures];
    if (inputFeatures.length === 84) {
      const h1 = inputFeatures.slice(0, 42);
      const h2 = inputFeatures.slice(42, 84);
      if (h2.some(v => v !== 0)) {

        swappedFeatures = [...h2, ...h1];
        swappedMirrored = [...mirroredFeatures.slice(42, 84), ...mirroredFeatures.slice(0, 42)];
      }
    }

    const distances = activeDataset.map(sample => {
      const featSize = Math.max(inputFeatures.length, sample.features.length);
      
      const padInput = [...inputFeatures];
      const padMirrored = [...mirroredFeatures];
      const padSwapped = [...swappedFeatures];
      const padSwappedMirrored = [...swappedMirrored];
      const padSample = [...sample.features];
      
      while (padInput.length < featSize) padInput.push(0);
      while (padMirrored.length < featSize) padMirrored.push(0);
      while (padSwapped.length < featSize) padSwapped.push(0);
      while (padSwappedMirrored.length < featSize) padSwappedMirrored.push(0);
      while (padSample.length < featSize) padSample.push(0);

      const distNormal = euclideanDistance(padInput, padSample);
      const distMirrored = euclideanDistance(padMirrored, padSample);
      const distSwapped = euclideanDistance(padSwapped, padSample);
      const distSwappedMirrored = euclideanDistance(padSwappedMirrored, padSample);

      return {
        label: sample.label,
        distance: Math.min(distNormal, distMirrored, distSwapped, distSwappedMirrored)
      };
    });

    distances.sort((a, b) => a.distance - b.distance);
    const neighbors = distances.slice(0, k);

    const votes = {};
    neighbors.forEach(n => {
      votes[n.label] = (votes[n.label] || 0) + 1;
    });

    let maxLabel = '?';
    let maxVotes = 0;
    Object.entries(votes).forEach(([label, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        maxLabel = label;
      }
    });

    return {
      label: maxLabel,
      confidence: Math.round((maxVotes / k) * 100)
    };
  };


  const handleHandResults = (results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      predictionBufferRef.current = [];
      trajectoryBufferRef.current = [];
      setPrediction('No Sign Detected');
      setConfidence(0);
      stabilityCountRef.current = 0;
      stabilityLabelRef.current = null;
      lastAppendedLabelRef.current = null;
      lastSpokenRef.current = '';
      return;
    }

    results.multiHandLandmarks.forEach((landmarks, idx) => {
      const label = results.multiHandedness[idx]?.label;
      drawAdvancedHand(ctx, landmarks, label === 'Right');
    });
    

    let dataAux = [];
    const hand1 = results.multiHandLandmarks[0];
    const { features: feat1, scale: scale1, minX: minX1, minY: minY1 } = getNormalizedLandmarks(hand1);
    dataAux.push(...feat1);

    if (results.multiHandLandmarks.length === 2) {
      const hand2 = results.multiHandLandmarks[1];
      const { features: feat2 } = getNormalizedLandmarks(hand2);
      dataAux.push(...feat2);
    } else {
      dataAux.push(...new Array(42).fill(0));
    }

    const wrist = hand1[0];
    trajectoryBufferRef.current.push({ x: wrist.x, y: wrist.y, time: Date.now() });
    if (trajectoryBufferRef.current.length > 30) trajectoryBufferRef.current.shift();

    let dynamicSign = null;
    

    if (trajectoryBufferRef.current.length >= 15 && results.multiHandLandmarks.length === 1) {
      const xVals = trajectoryBufferRef.current.map(p => p.x);
      const minX = Math.min(...xVals);
      const maxX = Math.max(...xVals);
      const deltaX = maxX - minX;

      const start = trajectoryBufferRef.current[0];
      const end = trajectoryBufferRef.current[trajectoryBufferRef.current.length - 1];
      const speed = Math.abs(end.x - start.x) / ((end.time - start.time) / 1000);

      if (deltaX > 0.18 && speed > 0.4) {
        dynamicSign = 'HELLO / WAVE';
      }
    }


    if (trajectoryBufferRef.current.length >= 12) {


      const wristPositions = trajectoryBufferRef.current.map(p => p.x);
      const wristDelta = Math.max(...wristPositions) - Math.min(...wristPositions);


      const indexTip = hand1[8];
      const pinkyTip = hand1[20];
      if (!window.clapHistory) window.clapHistory = [];
      window.clapHistory.push({
        wristX: wrist.x,
        wristY: wrist.y,
        indexX: indexTip.x,
        indexY: indexTip.y,
        pinkyX: pinkyTip.x,
        pinkyY: pinkyTip.y,
        time: Date.now()
      });
      if (window.clapHistory.length > 20) window.clapHistory.shift();

      if (window.clapHistory.length >= 10) {
        const wristXs = window.clapHistory.map(h => h.wristX);
        const wristYs = window.clapHistory.map(h => h.wristY);
        const wristDx = Math.max(...wristXs) - Math.min(...wristXs);
        const wristDy = Math.max(...wristYs) - Math.min(...wristYs);
        const isWristStable = wristDx < 0.12 && wristDy < 0.12;

        const indexXs = window.clapHistory.map(h => h.indexX);
        const indexDx = Math.max(...indexXs) - Math.min(...indexXs);

        let directionChanges = 0;
        let lastDelta = 0;
        for (let i = 1; i < window.clapHistory.length; i++) {
          const delta = window.clapHistory[i].indexX - window.clapHistory[i-1].indexX;
          if (i > 1 && ((delta > 0.005 && lastDelta < -0.005) || (delta < -0.005 && lastDelta > 0.005))) {
            directionChanges++;
          }
          if (Math.abs(delta) > 0.005) {
            lastDelta = delta;
          }
        }

        if (isWristStable && indexDx > 0.16 && directionChanges >= 3) {
          dynamicSign = 'CLAP / APPLAUSE';
        }
      }
    }

    let finalLabel = '?';
    let finalConf = 0;

    const knnRes = predictKNN(dataAux, 7);
    const isCustom = customGestures.some(g => g.label === knnRes.label);

    if (dynamicSign) {
      finalLabel = dynamicSign;
      finalConf = 95;
    } else if (isCustom && knnRes.confidence >= 55) {

      finalLabel = knnRes.label;
      finalConf = knnRes.confidence;
    } else {

      finalLabel = knnRes.label;
      finalConf = knnRes.confidence;
    }

    if (activeTab === 'gesture-studio' && isRecording) {
      setRecordedFrames(prev => [...prev, dataAux]);
    }


    if (finalLabel !== '?') {
      predictionBufferRef.current.push(finalLabel);
      if (predictionBufferRef.current.length > 10) {
        predictionBufferRef.current.shift();
      }

      const counts = {};
      predictionBufferRef.current.forEach(l => {
        counts[l] = (counts[l] || 0) + 1;
      });

      let smoothLabel = finalLabel;
      let maxCount = 0;
      Object.entries(counts).forEach(([l, count]) => {
        if (count > maxCount) {
          maxCount = count;
          smoothLabel = l;
        }
      });

      const bufferMajorityPercentage = maxCount / predictionBufferRef.current.length;

      if (bufferMajorityPercentage >= 0.7) {
        const now = Date.now();
        if (now - lastUIUpdateRef.current > 250 || smoothLabel !== prediction) {
          setPrediction(smoothLabel);
          setConfidence(finalConf);
          lastUIUpdateRef.current = now;
        }

        if (smoothLabel === 'No Sign Detected') {
          lastAppendedLabelRef.current = null;
          lastSpokenRef.current = '';
          stabilityCountRef.current = 0;
          stabilityLabelRef.current = null;
        } else {

          if (stabilityLabelRef.current !== smoothLabel) {
            stabilityLabelRef.current = smoothLabel;
            stabilityCountRef.current = 1;
          } else {
            stabilityCountRef.current += 1;
          }


          if (stabilityCountRef.current >= 8) {
            if (isCapturing && smoothLabel !== '?' && smoothLabel !== lastAppendedLabelRef.current) {
              setTranslationHistory(prev => [
                { text: smoothLabel, time: new Date().toLocaleTimeString() },
                ...prev
              ]);
              lastAppendedLabelRef.current = smoothLabel;
              if (autoSpeak) {
                speakText(smoothLabel);
              }
            } else if (!isCapturing && autoSpeak && smoothLabel !== lastSpokenRef.current) {
              speakText(smoothLabel);
              lastSpokenRef.current = smoothLabel;
            }
          }
        }
      }
    }
  };

  const addLetterToHistory = () => {
    if (prediction && prediction !== 'No Sign Detected' && prediction !== '?') {
      setTranslationHistory(prev => [
        { text: prediction, time: new Date().toLocaleTimeString() },
        ...prev
      ]);
    }
  };

  const clearHistory = () => {
    setTranslationHistory([]);
  };


  const tokenizePhrase = (text) => {
    const cleanText = text.toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim();
    
    const defaultPhrases = [...dictionaryItems];

    const phraseSet = new Set();
    for (const p of defaultPhrases) {
      phraseSet.add(p.toUpperCase());
    }


    for (const item of dictionaryItems) {
      if (item.length > 1) {
        phraseSet.add(item.toUpperCase());
      }
    }


    if (SYNONYMS) {
      for (const [key, list] of Object.entries(SYNONYMS)) {
        phraseSet.add(key.toUpperCase());
        if (Array.isArray(list)) {
          for (const val of list) {
            if (typeof val === 'string') {
              phraseSet.add(val.toUpperCase());
            }
          }
        }
      }
    }


    const supportedPhrases = Array.from(phraseSet).sort((a, b) => b.length - a.length);
    
    let tokens = [];
    let index = 0;
    

    const processedText = cleanText.replace(/\bMY NAME IS\b/g, "MY NAME").replace(/\bHOW ARE YOU\b/g, "HOW YOU");
    
    while (index < processedText.length) {
      if (processedText[index] === ' ') {
        tokens.push(' ');
        index++;
        continue;
      }

      let matched = false;
      for (const phrase of supportedPhrases) {
        if (processedText.substring(index, index + phrase.length) === phrase) {
          tokens.push(phrase);
          index += phrase.length;
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        const nextSpace = processedText.indexOf(' ', index);
        const wordEnd = nextSpace === -1 ? processedText.length : nextSpace;
        const word = processedText.substring(index, wordEnd);
        
        if (word.length === 1) {
          tokens.push(word);
          index++;
        } else {
          tokens.push("QUESTION");
          index += word.length;
        }
      }
    }
    
    return tokens;
  };


  const handleTranslatePlayback = () => {
    if (!textToTranslate.trim()) return;
    
    if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    setIsPlaying(true);
    setCurrentPlaybackIndex(0);


    if (window.innerWidth <= 1024 && avatarCanvasRef.current) {
      avatarCanvasRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const tokens = tokenizePhrase(textToTranslate);
    setPlaybackText(tokens);

    let currentIndex = 0;
    

    speakText(textToTranslate);

    const canvas = avatarCanvasRef.current;
    const firstToken = tokens[0];
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (firstToken === ' ') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        drawProceduralLetter(ctx, firstToken, signLang);
      }
    }

    playbackIntervalRef.current = setInterval(() => {
      currentIndex++;
      if (currentIndex >= tokens.length) {
        clearInterval(playbackIntervalRef.current);
        setIsPlaying(false);
        setCurrentPlaybackIndex(-1);
        return;
      }

      setCurrentPlaybackIndex(currentIndex);
      const token = tokens[currentIndex];
      
      const canvas = avatarCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (token === ' ') {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
          drawProceduralLetter(ctx, token, signLang);
        }
      }
    }, playbackSpeed);
  };

  const handlePausePlayback = () => {
    setIsPlaying(false);
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }
  };

  const handleResetPlayback = () => {
    setIsPlaying(false);
    setCurrentPlaybackIndex(-1);
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }
    const canvas = avatarCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };


  const startRecordingGesture = () => {
    if (!newGestureName.trim()) {
      alert("Please enter a name for the gesture.");
      return;
    }
    if (!isCameraActive) {
      alert("Please start the camera first.");
      return;
    }
    setIsRecording(true);
    setRecordProgress(0);
    setRecordedFrames([]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setRecordProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsRecording(false);
        saveRecordedGesture();
      }
    }, 50);
  };

  const saveRecordedGesture = () => {
    setRecordedFrames(prev => {
      if (prev.length === 0) {
        alert("No hand landmarks detected during recording. Please try again.");
        return prev;
      }

      const newSamples = prev.map(features => ({
        label: newGestureName.toUpperCase(),
        features: features.map(f => Math.round(f * 10000) / 10000)
      }));

      setCustomGestures(old => [...old, ...newSamples]);
      alert(`Success: Calibrated "${newGestureName.toUpperCase()}" with ${newSamples.length} samples!`);
      setNewGestureName('');
      return [];
    });
  };

  const deleteCustomGesture = (labelToDelete) => {
    setCustomGestures(prev => prev.filter(g => g.label !== labelToDelete));
  };

  const uniqueCustomGestures = [...new Set(customGestures.map(g => g.label))];

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-card glass-panel">
          <div className="login-logo-container">
            <div className="logo-icon" style={{ boxShadow: 'var(--glow-purple)' }}>
              <SignBridgeLogo size={22} />
            </div>
            <span className="logo-text">SignBridge</span>
          </div>
          
          <h2 className="login-title">
            {authMode === 'login' ? 'Sign In to Your Workspace' : 
             authMode === 'register' ? 'Create an Account' : 
             authMode === 'forgot_password' ? 'Reset Password' :
             authMode === 'verify_otp' ? 'Enter OTP' :
             'Create New Password'}
          </h2>
          <p className="login-subtitle">
            {authMode === 'login' 
              ? 'Access Indian Sign Language translation tools & custom calibration studio.'
              : authMode === 'register' ? 'Join to start using Indian Sign Language translation tools.'
              : authMode === 'forgot_password' ? 'Enter your email to receive a One-Time Password.'
              : authMode === 'verify_otp' ? 'Check your email for the 6-digit code.'
              : 'Enter your new secure password below.'}
          </p>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} noValidate className="login-form">

              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <input 
                  type="email" 
                  id="login-email" 
                  name="email"
                  placeholder="Enter your email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={`login-input ${loginErrors.email ? 'input-error' : ''}`}
                  autoComplete="email"
                  aria-invalid={loginErrors.email ? "true" : "false"}
                  aria-describedby={loginErrors.email ? "email-error" : undefined}
                  required
                />
                {loginErrors.email && (
                  <span id="email-error" className="error-message" aria-live="polite">
                    {loginErrors.email}
                  </span>
                )}
              </div>


              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="login-password">Password</label>
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="login-password" 
                  name="password"
                  placeholder="Enter your password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`login-input ${loginErrors.password ? 'input-error' : ''}`}
                  autoComplete="current-password"
                  aria-invalid={loginErrors.password ? "true" : "false"}
                  aria-describedby={loginErrors.password ? "password-error" : undefined}
                  required
                />
                {loginErrors.password && (
                  <span id="password-error" className="error-message" aria-live="polite">
                    {loginErrors.password}
                  </span>
                )}
                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                  <span style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }} onClick={() => { setAuthMode('forgot_password'); setLoginErrors({}); }}>
                    Forgot Password?
                  </span>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="accessible-verify" 
                  name="verify"
                  style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="accessible-verify" style={{ cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Keep me signed in on this device
                </label>
              </div>

              <button type="submit" className="btn-action btn-action-primary login-btn">
                Sign In
              </button>
              
              <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                Don't have an account? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }} onClick={() => { setAuthMode('register'); setLoginErrors({}); }}>Sign Up</span>
              </div>
            </form>
          ) : authMode === 'register' ? (
            <form onSubmit={handleRegister} noValidate className="login-form">

              <div className="form-group">
                <label htmlFor="register-fullname">Full Name</label>
                <input 
                  type="text" 
                  id="register-fullname" 
                  name="fullname"
                  placeholder="Enter your full name" 
                  value={registerFullName}
                  onChange={(e) => setRegisterFullName(e.target.value)}
                  className={`login-input ${registerErrors.fullName ? 'input-error' : ''}`}
                  autoComplete="name"
                  required
                />
                {registerErrors.fullName && (
                  <span className="error-message" aria-live="polite">{registerErrors.fullName}</span>
                )}
              </div>


              <div className="form-group">
                <label htmlFor="register-email">Email Address</label>
                <input 
                  type="email" 
                  id="register-email" 
                  name="email"
                  placeholder="Enter your email" 
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className={`login-input ${registerErrors.email ? 'input-error' : ''}`}
                  autoComplete="email"
                  required
                />
                {registerErrors.email && (
                  <span className="error-message" aria-live="polite">{registerErrors.email}</span>
                )}
              </div>


              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="register-password">Password</label>
                  <button 
                    type="button" 
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="password-toggle"
                  >
                    {showRegisterPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input 
                  type={showRegisterPassword ? "text" : "password"} 
                  id="register-password" 
                  name="password"
                  placeholder="Create a password" 
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className={`login-input ${registerErrors.password ? 'input-error' : ''}`}
                  required
                />
                {registerPassword && (
                  <div style={{ fontSize: '12px', marginTop: '4px', textAlign: 'right', color: getPasswordStrength(registerPassword) === 'Strong' ? '#2ecc71' : '#e74c3c' }}>
                    Strength: {getPasswordStrength(registerPassword)}
                  </div>
                )}
                {registerErrors.password && (
                  <span className="error-message" aria-live="polite">{registerErrors.password}</span>
                )}
              </div>


              <div className="form-group">
                <label htmlFor="register-confirm-password">Confirm Password</label>
                <input 
                  type={showRegisterPassword ? "text" : "password"} 
                  id="register-confirm-password" 
                  name="confirmPassword"
                  placeholder="Confirm your password" 
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  className={`login-input ${registerErrors.confirmPassword ? 'input-error' : ''}`}
                  required
                />
                {registerErrors.confirmPassword && (
                  <span className="error-message" aria-live="polite">{registerErrors.confirmPassword}</span>
                )}
              </div>

              <button type="submit" className="btn-action btn-action-primary login-btn" style={{ marginTop: '10px' }}>
                Sign Up
              </button>
              
              <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                Already have an account? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }} onClick={() => { setAuthMode('login'); setRegisterErrors({}); }}>Sign In</span>
              </div>
            </form>
          ) : authMode === 'forgot_password' ? (
            <form onSubmit={handleForgotPassword} noValidate className="login-form">
              {resetSuccessMsg && <div className="success-message" style={{ color: '#2ecc71', marginBottom: '10px', textAlign: 'center' }}>{resetSuccessMsg}</div>}
              <div className="form-group">
                <label htmlFor="reset-email">Email Address</label>
                <input 
                  type="email" id="reset-email" name="email" placeholder="Enter your email" 
                  value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                  className={`login-input ${resetErrors.email ? 'input-error' : ''}`} required
                />
                {resetErrors.email && <span className="error-message">{resetErrors.email}</span>}
              </div>
              <button type="submit" className="btn-action btn-action-primary login-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send OTP'}
              </button>
              <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                Remember your password? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }} onClick={() => { setAuthMode('login'); setResetErrors({}); }}>Sign In</span>
              </div>
            </form>
          ) : authMode === 'verify_otp' ? (
            <form onSubmit={handleVerifyOtp} noValidate className="login-form">
              {resetSuccessMsg && <div className="success-message" style={{ color: '#2ecc71', marginBottom: '10px', textAlign: 'center' }}>{resetSuccessMsg}</div>}
              <div className="form-group">
                <label htmlFor="reset-otp">6-Digit OTP</label>
                <input 
                  type="text" id="reset-otp" name="otp" placeholder="Enter 6-digit OTP" 
                  value={resetOtp} onChange={(e) => setResetOtp(e.target.value)}
                  className={`login-input ${resetErrors.otp ? 'input-error' : ''}`} required
                />
                {resetErrors.otp && <span className="error-message">{resetErrors.otp}</span>}
              </div>
              <button type="submit" className="btn-action btn-action-primary login-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                Didn't receive it? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }} onClick={() => { setAuthMode('forgot_password'); setResetErrors({}); }}>Try Again</span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} noValidate className="login-form">
              {resetSuccessMsg && <div className="success-message" style={{ color: '#2ecc71', marginBottom: '10px', textAlign: 'center' }}>{resetSuccessMsg}</div>}
              <div className="form-group">
                <label htmlFor="reset-new-password">New Password</label>
                <input 
                  type="password" id="reset-new-password" name="newPassword" placeholder="Enter new password" 
                  value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)}
                  className={`login-input ${resetErrors.newPassword ? 'input-error' : ''}`} required
                />
                {resetNewPassword && (
                  <div style={{ fontSize: '12px', marginTop: '4px', textAlign: 'right', color: getPasswordStrength(resetNewPassword) === 'Strong' ? '#2ecc71' : '#e74c3c' }}>
                    Strength: {getPasswordStrength(resetNewPassword)}
                  </div>
                )}
                {resetErrors.newPassword && <span className="error-message">{resetErrors.newPassword}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="reset-confirm-password">Confirm Password</label>
                <input 
                  type="password" id="reset-confirm-password" name="confirmPassword" placeholder="Confirm new password" 
                  value={resetConfirmPassword} onChange={(e) => setResetConfirmPassword(e.target.value)}
                  className={`login-input ${resetErrors.confirmPassword ? 'input-error' : ''}`} required
                />
                {resetErrors.confirmPassword && <span className="error-message">{resetErrors.confirmPassword}</span>}
              </div>
              <button type="submit" className="btn-action btn-action-primary login-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>

      {!isSidebarCollapsed && (
        <div className="mobile-sidebar-overlay" onClick={() => setIsSidebarCollapsed(true)}></div>
      )}
      

      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon" title="SignBridge">
            <SignBridgeLogo size={20} />
          </div>
          {!isSidebarCollapsed && <span className="logo-text">SignBridge</span>}
          <button className="sidebar-toggle-btn" onClick={toggleSidebar} title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <ul className="nav-links">
          <li 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
            title={isSidebarCollapsed ? "Dashboard" : ""}
          >
            <Layers size={18} />
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </li>
          <li 
            className={`nav-item ${activeTab === 'sign-to-speech' ? 'active' : ''}`}
            onClick={() => handleTabChange('sign-to-speech')}
            title={isSidebarCollapsed ? "Sign-to-Speech" : ""}
          >
            <Video size={18} />
            {!isSidebarCollapsed && <span>Sign-to-Speech</span>}
          </li>
          <li 
            className={`nav-item ${activeTab === 'anuvaad-video' ? 'active' : ''}`}
            onClick={() => handleTabChange('anuvaad-video')}
            title={isSidebarCollapsed ? "Anuvaad Video" : ""}
          >
            <Speech size={18} />
            {!isSidebarCollapsed && <span>Anuvaad Video</span>}
          </li>
          <li 
            className={`nav-item ${activeTab === 'gesture-studio' ? 'active' : ''}`}
            onClick={() => handleTabChange('gesture-studio')}
            title={isSidebarCollapsed ? "Gesture Studio" : ""}
          >
            <Plus size={18} />
            {!isSidebarCollapsed && <span>Gesture Studio</span>}
          </li>
          <li 
            className={`nav-item ${activeTab === 'anuvaad-stream' ? 'active' : ''}`}
            onClick={() => handleTabChange('anuvaad-stream')}
            title={isSidebarCollapsed ? "Anuvaad Stream" : ""}
          >
            <BookOpen size={18} />
            {!isSidebarCollapsed && <span>Anuvaad Stream</span>}
          </li>
        </ul>

        <div className="sidebar-footer" style={{ flexDirection: isSidebarCollapsed ? 'column' : 'row', gap: '12px', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="user-avatar" title={getDisplayName()}>{getInitials(getDisplayName())}</div>
            {!isSidebarCollapsed && (
              <div className="user-info">
                <span className="user-name">{getDisplayName()}</span>
                <span className="user-role">SignBridge Studio</span>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout} 
            className="logout-btn" 
            title="Sign Out"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--danger)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '8px',
              transition: 'background 0.2s',
              marginLeft: isSidebarCollapsed ? '0' : 'auto'
            }}
          >
            <LogOut size={16} />
            {!isSidebarCollapsed && <span style={{ marginLeft: '6px', fontSize: '13px', fontWeight: '700' }}>Sign Out</span>}
          </button>
        </div>
      </aside>


      <main className="main-content">
        <header className="header">
          <div className="mobile-header-controls">
            <button className="mobile-menu-btn" onClick={toggleSidebar} title="Open Menu">
              <Menu size={24} />
            </button>
            <h1 className="mobile-header-logo">SignBridge</h1>
          </div>
          <div className="header-title-container">
            <h1>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'sign-to-speech' && 'Sign-to-Speech Translator'}
              {activeTab === 'anuvaad-video' && 'Anuvaad Video (Real-time Sequence)'}
              {activeTab === 'gesture-studio' && 'Custom Gesture Studio'}
              {activeTab === 'anuvaad-stream' && 'Anuvaad Live Stream'}
            </h1>
            <span className="header-subtitle">
              Interactive Indian Sign Language Translation & Training Platform
            </span>
          </div>


          <div className="header-actions">
            <div className="status-badge">
              <div className="status-dot"></div>
              <span>System Live</span>
            </div>
          </div>
        </header>

        <div className="content-body">

          {activeTab === 'dashboard' && (
            <div className="dashboard-portal-container">

              <div className="portal-left-panel glass-panel">
                <div className="portal-welcome-section">
                  <div className="portal-greeting-badge">
                    <span className="portal-greeting-dot"></span>
                    ACTIVE WORKSPACE
                  </div>
                  <h2 className="portal-greeting-title">Hello, {getDisplayName()}</h2>
                  <p className="portal-greeting-desc">
                    Welcome back to SignBridge Studio. Your workspace is calibrated and ready.
                  </p>
                </div>

                <div className="portal-system-status">
                  <h3 className="portal-sub-title">System Environment</h3>
                  <div className="status-indicator-list">
                    <div className="status-indicator-item">
                      <span className="status-label">Webcam Connection</span>
                      <span className={`status-val ${isCameraActive ? 'active' : 'inactive'}`}>
                        {isCameraActive ? 'Active Feed' : 'Standby / Connected'}
                      </span>
                    </div>
                    <div className="status-indicator-item">
                      <span className="status-label">AI Tracking Engine</span>
                      <span className="status-val active">MediaPipe v0.10 Loaded</span>
                    </div>
                    <div className="status-indicator-item">
                      <span className="status-label">Current Dictionary</span>
                      <span className="status-val highlight">{signLang} (Indian Sign Language)</span>
                    </div>
                    <div className="status-indicator-item">
                      <span className="status-label">Vocabulary Size</span>
                      <span className="status-val highlight">{dictionaryItems.length} Signs</span>
                    </div>
                    <div className="status-indicator-item">
                      <span className="status-label">Calibrated Custom Gestures</span>
                      <span className="status-val highlight">{uniqueCustomGestures.length} Gestures</span>
                    </div>
                  </div>
                </div>


                <div className="portal-search-widget">
                  <h3 className="portal-sub-title">Instant Sign Dictionary Lookup</h3>
                  <p className="portal-widget-desc">Type any dictionary word or letter below to view its sign reference instantly.</p>
                  <div className="lookup-search-container">
                    <input
                      type="text"
                      className="lookup-search-input"
                      placeholder="e.g. hello, please, victory, A, 3..."
                      value={dashboardLookupWord}
                      onChange={(e) => setDashboardLookupWord(e.target.value)}
                    />
                    {dashboardLookupWord.trim() && (
                      <button className="lookup-clear-btn" onClick={() => setDashboardLookupWord('')}>
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {dashboardLookupWord.trim() && (
                    <div className="lookup-preview-box">
                      {(() => {
                        const searchWord = dashboardLookupWord.trim().toUpperCase();
                        const exists = dictionaryItems.some(item => item.toUpperCase() === searchWord);
                        if (exists) {
                          return (
                            <div className="lookup-preview-card">
                              <div className="lookup-preview-badge">{searchWord}</div>
                              <div className="lookup-preview-image-container">
                                <DictionaryImage item={searchWord} signLang={signLang} width={120} height={120} customDict={customDictionary} />
                              </div>
                              <span className="lookup-preview-title">
                                {isNaN(searchWord) ? (searchWord.length > 1 ? `Word/Phrase "${searchWord}"` : `Letter ${searchWord}`) : `Digit ${searchWord}`}
                              </span>
                            </div>
                          );
                        } else {

                          let synonymKey = null;
                          if (SYNONYMS) {
                            for (const [key, list] of Object.entries(SYNONYMS)) {
                              const keyMatch = key.toUpperCase() === searchWord;
                              const listMatch = Array.isArray(list) && list.some(val => typeof val === 'string' && val.toUpperCase() === searchWord);
                              if (keyMatch || listMatch) {
                                synonymKey = key.toUpperCase();
                                break;
                              }
                            }
                          }
                          
                          if (synonymKey) {
                            return (
                              <div className="lookup-preview-card">
                                <div className="lookup-preview-badge">{searchWord}</div>
                                <div className="lookup-preview-image-container">
                                  <DictionaryImage item={synonymKey} signLang={signLang} width={120} height={120} customDict={customDictionary} />
                                </div>
                                <span className="lookup-preview-title">
                                  Synonym of "{synonymKey}"
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div className="lookup-no-results">
                              <HelpCircle size={24} style={{ color: 'var(--text-muted)' }} />
                              <span>"{searchWord}" not found in Dictionary.</span>
                              <span style={{ fontSize: '11px', marginTop: '4px' }}>It will fall back to "QUESTION" sign or single-character spelling in visualizer.</span>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>


              <div className="portal-right-panel">
                <h2 className="portal-section-title">Studio Quick Launch Toolkit</h2>
                
                <div className="launcher-list">

                  <div className="launcher-row glass-panel" onClick={() => {
                    setActiveTab('sign-to-speech');
                    startCamera();
                  }}>
                    <div className="launcher-icon-box cyan-theme">
                      <Video size={22} />
                    </div>
                    <div className="launcher-details">
                      <h3 className="launcher-title">Live Sign-to-Speech Translation</h3>
                      <p className="launcher-desc">
                        Translate live hand gestures using your webcam. Employs our pre-calibrated ISL dataset and k-NN classifier.
                      </p>
                    </div>
                    <button className="btn-launcher-action">Launch</button>
                  </div>


                  <div className="launcher-row glass-panel" onClick={() => setActiveTab('text-to-sign')}>
                    <div className="launcher-icon-box purple-theme">
                      <Speech size={22} />
                    </div>
                    <div className="launcher-details">
                      <h3 className="launcher-title">Fingerspelling & Phrase Visualizer</h3>
                      <p className="launcher-desc">
                        Type words or speak phrases to watch the visualizer re-enact fingerspelling and custom gesture sequences.
                      </p>
                    </div>
                    <button className="btn-launcher-action">Launch</button>
                  </div>


                  <div className="launcher-row glass-panel" onClick={() => {
                    setActiveTab('gesture-studio');
                    startCamera();
                  }}>
                    <div className="launcher-icon-box orange-theme">
                      <Plus size={22} />
                    </div>
                    <div className="launcher-details">
                      <h3 className="launcher-title">Calibration Studio</h3>
                      <p className="launcher-desc">
                        Train custom gestures or adjust classifications to fit your workspace lighting and background.
                      </p>
                    </div>
                    <button className="btn-launcher-action">Launch</button>
                  </div>


                  <div className="launcher-row glass-panel" onClick={() => setActiveTab('guide')}>
                    <div className="launcher-icon-box blue-theme">
                      <BookOpen size={22} />
                    </div>
                    <div className="launcher-details">
                      <h3 className="launcher-title">Browse Dictionary & Upload Custom Signs</h3>
                      <p className="launcher-desc">
                        View letters, digits, standard expressions, and upload custom sign images with a custom label name.
                      </p>
                    </div>
                    <button className="btn-launcher-action">Launch</button>
                  </div>
                </div>


                <div className="portal-mini-stats">
                  <div className="mini-stat-card glass-panel">
                    <span className="mini-stat-val">{36 + uniqueCustomGestures.length}</span>
                    <span className="mini-stat-lbl">Active Signs</span>
                  </div>
                  <div className="mini-stat-card glass-panel">
                    <span className="mini-stat-val">26</span>
                    <span className="mini-stat-lbl">A-Z Letters</span>
                  </div>
                  <div className="mini-stat-card glass-panel">
                    <span className="mini-stat-val">10</span>
                    <span className="mini-stat-lbl">Digits (1-10)</span>
                  </div>
                  <div className="mini-stat-card glass-panel">
                    <span className="mini-stat-val">{customDictionary.length}</span>
                    <span className="mini-stat-lbl">Custom Signs</span>
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'sign-to-speech' && (
            <div className="webcam-layout">
              <div className="webcam-container glass-panel">

                {!isModelReady && isCameraActive && (
                  <div style={{ position: 'absolute', zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.85)', width: '100%', height: '100%', borderRadius: '20px' }}>
                    <div className="logo-icon" style={{ animation: 'pulse 1s infinite', marginBottom: '12px' }}>AI</div>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '15px' }}>Loading AI Hand Tracking Model...</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Compiling WASM binary (please wait a moment)</span>
                  </div>
                )}
                
                <video 
                  ref={videoRef} 
                  className="webcam-feed"
                  autoPlay 
                  playsInline 
                  muted
                />
                <canvas 
                  ref={canvasRef} 
                  className="webcam-canvas"
                  width={640}
                  height={480}
                />
                
                <div className="scan-line"></div>

                <div className="webcam-overlay">
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                      CAMERA: {isCameraActive ? 'ACTIVE' : 'OFF'}
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                      DICTIONARY: ISL
                    </span>
                  </div>
                </div>

                <div className="webcam-controls">
                  {isCameraActive ? (
                    <button className="btn-control active" onClick={stopCamera} title="Stop Video">
                      <VideoOff size={20} />
                    </button>
                  ) : (
                    <button className="btn-control" onClick={startCamera} title="Start Video">
                      <Video size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div className="output-sidebar">
                <div className="prediction-box glass-panel">
                  <span className="prediction-label">Classified Sign</span>
                  <span className="prediction-value">{prediction}</span>
                  
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      <span>Model Confidence</span>
                      <span>{confidence}%</span>
                    </div>
                    <div className="confidence-bar-container">
                      <div className="confidence-bar" style={{ width: `${confidence}%` }}></div>
                    </div>
                  </div>

                  <div className="translation-actions">
                    <button 
                      className={`btn-action btn-action-primary ${isCapturing ? 'btn-capturing-active' : ''}`}
                      onClick={() => {
                        setIsCapturing(!isCapturing);
                        lastAppendedLabelRef.current = null;
                        stabilityCountRef.current = 0;
                        stabilityLabelRef.current = null;
                      }}
                      style={{ padding: '14px 20px', fontSize: '15px' }}
                    >
                      <Video size={16} className={isCapturing ? 'record-pulse' : ''} />
                      {isCapturing ? 'Stop Capture' : 'Auto-Capture'}
                    </button>
                  </div>

                  <div className="translation-actions" style={{ marginTop: '8px' }}>
                    <button 
                      className="btn-action" 
                      onClick={() => speakText(prediction)}
                      disabled={prediction === 'No Sign Detected'}
                      style={{ padding: '10px 14px', fontSize: '12.5px' }}
                    >
                      <Volume2 size={14} /> Speak
                    </button>
                    <button 
                      className="btn-action" 
                      onClick={addLetterToHistory}
                      disabled={prediction === 'No Sign Detected'}
                      style={{ padding: '10px 14px', fontSize: '12.5px' }}
                    >
                      Add Manually
                    </button>
                    <button 
                      className="btn-action" 
                      onClick={() => {
                        setTranslationHistory(prev => [
                          { text: ' ', time: new Date().toLocaleTimeString() },
                          ...prev
                        ]);
                      }}
                      style={{ padding: '10px 14px', fontSize: '12.5px' }}
                    >
                      Add Space
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', width: '100%', justifyContent: 'center' }}>
                    <input 
                      type="checkbox" 
                      id="auto-speak" 
                      checked={autoSpeak}
                      onChange={(e) => setAutoSpeak(e.target.checked)}
                      style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    <label htmlFor="auto-speak" style={{ fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '500' }}>
                      Auto-speak signs on complete consensus
                    </label>
                  </div>


                  <div style={{ marginTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Sentence Builder</span>
                      {translationHistory.length > 0 && (
                        <button 
                          className="btn-control delete-btn" 
                          onClick={clearHistory} 
                          style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                          title="Clear Sentence"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    
                    <div style={{ minHeight: '60px', maxHeight: '100px', overflowY: 'auto', background: 'rgba(255,255,255,0.4)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', textAlign: 'left', display: 'flex', flexWrap: 'wrap', gap: '6px', alignContent: 'flex-start', width: '100%' }}>
                      {translationHistory.length === 0 ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12.5px', fontStyle: 'italic' }}>Build a sentence by starting Auto-Capture or clicking "Add Sign Manually".</span>
                      ) : (
                        translationHistory.map((item, idx) => (
                          <span key={idx} style={{ background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.15)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', fontSize: '12.5px', fontWeight: '700' }}>
                            {item.text === ' ' ? '␣' : item.text}
                          </span>
                        ))
                      )}
                    </div>

                    {translationHistory.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <button 
                          className="btn-action btn-action-primary" 
                          onClick={() => speakText(speakMode === 'combined' ? getCombinedText(translationHistory) : translationHistory.map(h => h.text).reverse().join(" "))}
                          style={{ padding: '8px 12px', fontSize: '12.5px', flexGrow: 1 }}
                        >
                          <Volume2 size={14} /> Speak Sentence
                        </button>
                        <button 
                          className="btn-action" 
                          onClick={() => setSpeakMode(speakMode === 'combined' ? 'letters' : 'combined')}
                          style={{ padding: '8px 12px', fontSize: '12.5px', flexGrow: 0 }}
                        >
                          {speakMode === 'combined' ? 'Combined Mode' : 'Spelled Mode'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'anuvaad-video' && <AnuvaadVideo />}

          {activeTab === 'gesture-studio' && (
            <div className="studio-layout">
              <div className="glass-panel">
                <div className="card-header">
                  <h2>Trained Sign Calibrator</h2>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>Calibration Preview</h3>
                    <div className="webcam-container glass-panel" style={{ width: '100%', height: '300px', position: 'relative', overflow: 'hidden' }}>

                      {!isModelReady && isCameraActive && (
                        <div style={{ position: 'absolute', zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.85)', width: '100%', height: '100%', borderRadius: '20px' }}>
                          <div className="logo-icon" style={{ animation: 'pulse 1s infinite', marginBottom: '12px' }}>AI</div>
                          <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px' }}>Initializing Model WASM...</span>
                        </div>
                      )}
                      
                      <video 
                        ref={videoRef} 
                        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                        autoPlay 
                        playsInline 
                        muted
                      />
                      <canvas 
                        ref={canvasRef} 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, transform: 'scaleX(-1)' }}
                        width={640}
                        height={480}
                      />
                      <div className="scan-line"></div>
                    </div>
                  </div>

                  <p className="record-instructions hide-on-mobile" style={{ margin: 0 }}>
                    Train custom signs (like Hello, Wave, OK, or ISL letter shapes) specifically for your webcam's lighting and distance. Type a name, then click Record.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, minWidth: '200px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>
                        New Gesture Label
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. WAVE, CLAP, OK..." 
                        value={newGestureName}
                        onChange={(e) => setNewGestureName(e.target.value)}
                        style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: '600', borderRadius: '12px', outline: 'none', width: '100%' }}
                        disabled={isRecording}
                      />
                    </div>

                    <button 
                      className="btn-action btn-action-primary record-gesture-btn" 
                      onClick={startRecordingGesture}
                      disabled={isRecording}
                    >
                      {isRecording ? 'Calibrating...' : 'Record (2.5s)'}
                    </button>
                  </div>

                  {isRecording && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600' }}>
                        <span>Hold sign configuration in front of camera...</span>
                        <span>{recordProgress}%</span>
                      </div>
                      <div className="record-progress-container" style={{ margin: 0 }}>
                        <div className="record-progress-bar" style={{ width: `${recordProgress}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-panel">
                <div className="card-header">
                  <h2>Active Calibration Database</h2>
                </div>
                <div className="card-body">
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px', lineHeight: '1.4' }}>
                    Trained custom signs loaded in current memory:
                  </p>
                  
                  {uniqueCustomGestures.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '32px 0' }}>
                      No custom calibrated signs in memory. Record a gesture to add.
                    </p>
                  ) : (
                    <div className="gesture-list">
                      {uniqueCustomGestures.map((label, idx) => {
                        const count = customGestures.filter(g => g.label === label).length;
                        return (
                          <div key={idx} className="gesture-card">
                            <div>
                              <div className="gesture-title">{label}</div>
                              <div className="gesture-details">{count} training frames</div>
                            </div>
                            <button className="btn-control delete-btn" onClick={() => deleteCustomGesture(label)} title="Delete label">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {activeTab === 'guide' && (
            <div className="glass-panel" style={{ width: '100%' }}>
              <div className="card-header">
                <h2>Indian Sign Language (ISL) Dictionary Reference</h2>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div className="dictionary-instructions">
                  <div className="instruction-header">
                    <HelpCircle size={20} className="instruction-icon" />
                    <h3>How to Use the ISL Sign Dictionary</h3>
                  </div>
                  <div className="instruction-grid">
                    <div className="instruction-step">
                      <div className="step-number">1</div>
                      <div className="step-text">
                        <strong>Browse & Filter:</strong> Scroll through the card grid to see letters (A-Z) and digits (1-10) in Indian Sign Language.
                      </div>
                    </div>
                    <div className="instruction-step">
                      <div className="step-number">2</div>
                      <div className="step-text">
                        <strong>Click to Expand:</strong> Click any card to open a high-resolution, maximized detail modal describing the gesture.
                      </div>
                    </div>
                    <div className="instruction-step">
                      <div className="step-number">3</div>
                      <div className="step-text">
                        <strong>Quick Navigation:</strong> Use the <strong>left/right arrow keys</strong> on your keyboard to flip between signs while the modal is open.
                      </div>
                    </div>
                  </div>
                </div>


                <div className="custom-dict-uploader-section" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '20px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>Custom Sign Dictionary Creator</span>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Expand the dictionary by uploading direct images of custom signs/phrases.</span>
                    </div>
                    <button
                      className="btn-action btn-action-primary"
                      onClick={() => setShowAddForm(!showAddForm)}
                      style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', flexGrow: 0 }}
                    >
                      <Plus size={16} />
                      {showAddForm ? 'Close Creator' : 'Add Custom Sign'}
                    </button>
                  </div>

                  {showAddForm && (
                    <form onSubmit={handleAddDictItem} className="glass-panel" style={{ marginTop: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', animation: 'fadeIn 0.3s ease' }}>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1, minWidth: '240px' }}>
                          <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>Sign Name / Phrase Label</label>
                          <input
                            type="text"
                            placeholder="e.g. DAD, MOM, WELCOME, HELLO..."
                            value={newDictLabel}
                            onChange={(e) => setNewDictLabel(e.target.value)}
                            style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.02)', color: 'var(--text-main)', fontWeight: '600', outline: 'none' }}
                            required
                          />
                        </div>


                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1.5, minWidth: '280px' }}>
                          <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>Sign Reference Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ padding: '8px', border: '1px dashed var(--border-color)', borderRadius: '10px', background: 'rgba(0,0,0,0.02)', fontSize: '13px', cursor: 'pointer' }}
                            required={!newDictImage}
                          />
                        </div>
                      </div>


                      {newDictImage && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Image Preview:</span>
                          <div style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', padding: '6px' }}>
                            <img src={newDictImage} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                        </div>
                      )}


                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '14px' }}>
                        <button
                          type="button"
                          className="btn-action"
                          onClick={() => {
                            setShowAddForm(false);
                            setNewDictLabel('');
                            setNewDictImage('');
                          }}
                          style={{ padding: '10px 16px', fontSize: '13px', flexGrow: 0, width: 'auto' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-action btn-action-primary"
                          disabled={!newDictLabel.trim() || !newDictImage}
                          style={{ padding: '10px 20px', fontSize: '13px', flexGrow: 0, width: 'auto' }}
                        >
                          Add to Dictionary
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Click on any card to view it in maximized detail.
                </p>


                <div className="dictionary-grid">
                  {dictionaryItems.map((item, idx) => {
                    const isLetter = isNaN(item);
                    const isDigit = !isLetter;
                    const isCustom = customDictionary.some(c => c.label === item.toUpperCase());

                    return (
                      <div 
                        key={idx} 
                        className="dictionary-card glass-panel"
                        onClick={() => setMaximizedSign(item)}
                      >


                        {isCustom && (
                          <button
                            className="btn-control delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCustomDictionaryItem(item.toUpperCase());
                            }}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              zIndex: 10,
                              width: '28px',
                              height: '28px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'rgba(239, 68, 68, 0.08)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.15)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            title="Delete Custom Sign"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                        
                        <div className="card-image-container">
                          <DictionaryImage item={item} signLang={signLang} width={160} height={160} customDict={customDictionary} />
                          <div className="card-overlay">
                            <span>Click to Expand</span>
                          </div>
                        </div>

                        <div className="card-info">
                          <span className="card-title">
                            {isDigit ? `Digit ${item}` : (item.length > 1 ? `Phrase "${item}"` : `Letter ${item}`)}
                          </span>
                          <span className="card-subtitle">
                            {isCustom ? "Custom Uploaded Sign" : "Sign Reference Visual"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {maximizedSign && (() => {
            const item = maximizedSign;
            const isDigit = !isNaN(item);
            const desc = SIGN_DESCRIPTIONS.ISL[item] || "No description available.";
            const currentIndex = dictionaryItems.indexOf(item);
            const prevItem = dictionaryItems[(currentIndex - 1 + dictionaryItems.length) % dictionaryItems.length];
            const nextItem = dictionaryItems[(currentIndex + 1) % dictionaryItems.length];

            return (
              <div className="modal-overlay" onClick={() => setMaximizedSign(null)}>
                <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
                  <button className="modal-close-btn" onClick={() => setMaximizedSign(null)} title="Close (Esc)">
                    <X size={22} />
                  </button>
                  
                  <div className="modal-body">

                    <div className="modal-image-column">
                      <DictionaryImage item={item} signLang={signLang} width={280} height={280} className="modal-image" customDict={customDictionary} />
                    </div>
                    

                    <div className="modal-details-column">
                      <div className="modal-header-row">
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <h2 className="modal-title">{isDigit ? `Digit ${item}` : (item.length > 1 ? `Phrase "${item}"` : `Letter ${item}`)}</h2>
                          <span className="modal-subtitle">
                            Indian Sign Language (ISL)
                          </span>
                        </div>
                      </div>
                      
                      <p className="modal-desc">{desc}</p>
                      
                      <div className="modal-table-container">
                        <table className="modal-details-table">
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', paddingBottom: '8px', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Finger/Aspect</th>
                              <th style={{ textAlign: 'right', paddingBottom: '8px', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Configuration State</th>
                            </tr>
                          </thead>
                          <tbody>
                            {isDigit ? (
                              <>
                                <tr><td>Sign Type</td><td>ISL Digit (Single-Hand)</td></tr>
                                <tr><td>Interactive Form</td><td>Counts 1 to 10</td></tr>
                                <tr><td>Visual Style</td><td>Indian Numeric Signs (Aligned with Dataset)</td></tr>
                              </>
                            ) : (
                              <>
                                <tr><td>Dominant Hand</td><td>Active Fingerspelling</td></tr>
                                <tr><td>Non-Dominant Hand</td><td>Passive Contact</td></tr>
                                <tr><td>Finger Interaction</td><td>Tips & Palms Touching</td></tr>
                                <tr><td>Visual Form</td><td>ISL Two-Handed</td></tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  

                  <div className="modal-footer-nav">
                    <button 
                      className="modal-nav-btn" 
                      onClick={() => setMaximizedSign(prevItem)}
                      title="Previous Sign (Left Arrow)"
                    >
                      <ChevronLeft size={18} />
                      <span>Prev ({prevItem})</span>
                    </button>
                    <span className="modal-nav-counter">
                      {currentIndex + 1} of 36
                    </span>
                    <button 
                      className="modal-nav-btn" 
                      onClick={() => setMaximizedSign(nextItem)}
                      title="Next Sign (Right Arrow)"
                    >
                      <span>Next ({nextItem})</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
}
