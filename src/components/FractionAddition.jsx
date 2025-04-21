import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import './FractionAddition.css';

const FractionAddition = () => {
  const [fractions, setFractions] = useState({
    fraction1: { numerator: '', denominator: '' },
    fraction2: { numerator: '', denominator: '' }
  });
  const [droppedFractions, setDroppedFractions] = useState([]);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({
    commonDenominator: '',
    adjustedNumerator1: '',
    adjustedNumerator2: '',
    sumNumerator: '',
    simplifiedNumerator: '',
    simplifiedDenominator: ''
  });
  const [feedback, setFeedback] = useState('');
  const [fractionsLocked, setFractionsLocked] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [stepAnimation, setStepAnimation] = useState('');
  const [showNextButton, setShowNextButton] = useState(false);

  useEffect(() => {
    // Trigger step animation when currentStep changes
    setStepAnimation('step-exit');
    const timer = setTimeout(() => {
      setStepAnimation('step-enter');
    }, 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleInputChange = (fractionKey, part, value) => {
    if (fractionsLocked) return;
    
    setFractions(prev => ({
      ...prev,
      [fractionKey]: {
        ...prev[fractionKey],
        [part]: value
      }
    }));
  };

  const handleStudentAnswerChange = (field, value) => {
    setStudentAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDragStart = (e, fractionKey) => {
    e.dataTransfer.setData('text/plain', fractionKey);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const fractionKey = e.dataTransfer.getData('text/plain');
    const fraction = fractions[fractionKey];
    
    if (!droppedFractions.some(f => f.id === fractionKey)) {
      const newDroppedFractions = [...droppedFractions, { 
        id: fractionKey,
        ...fraction
      }];
      setDroppedFractions(newDroppedFractions);
      
      // Auto-lock fractions when both are dropped
      if (newDroppedFractions.length === 2) {
        setFractionsLocked(true);
      }
    }
  };

  const resetAll = () => {
    setFractions({
      fraction1: { numerator: '', denominator: '' },
      fraction2: { numerator: '', denominator: '' }
    });
    setDroppedFractions([]);
    setResult(null);
    setShowResult(false);
    setCurrentStep(0);
    setStudentAnswers({
      commonDenominator: '',
      adjustedNumerator1: '',
      adjustedNumerator2: '',
      sumNumerator: '',
      simplifiedNumerator: '',
      simplifiedDenominator: ''
    });
    setFeedback('');
    setFractionsLocked(false);
    setIsComplete(false);
  };

  const calculateSum = () => {
    const f1 = droppedFractions[0];
    const f2 = droppedFractions[1];
    
    const num1 = parseInt(f1.numerator);
    const den1 = parseInt(f1.denominator);
    const num2 = parseInt(f2.numerator);
    const den2 = parseInt(f2.denominator);
    
    // Find common denominator
    const commonDen = den1 * den2;
    const newNum1 = num1 * den2;
    const newNum2 = num2 * den1;
    const sumNum = newNum1 + newNum2;
    
    // Simplify fraction
    const gcd = findGCD(sumNum, commonDen);
    
    setResult({
      numerator: sumNum / gcd,
      denominator: commonDen / gcd,
      steps: {
        commonDenominator: commonDen,
        adjustedNumerator1: newNum1,
        adjustedNumerator2: newNum2,
        sumNumerator: sumNum,
        simplifiedNumerator: sumNum / gcd,
        simplifiedDenominator: commonDen / gcd
      }
    });
    setShowResult(true);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    setStepAnimation('step-exit');
    setTimeout(() => {
      setFeedback('');
      setCurrentStep(currentStep + 1);
      setShowNextButton(false);
      setAnimationKey(prev => prev + 1);
    }, 500);
  };

  const checkAnswer = () => {
    const f1 = droppedFractions[0];
    const f2 = droppedFractions[1];
    const num1 = parseInt(f1.numerator);
    const den1 = parseInt(f1.denominator);
    const num2 = parseInt(f2.numerator);
    const den2 = parseInt(f2.denominator);

    let isCorrect = false;
    let message = '';

    switch (currentStep) {
      case 0: // Common denominator
        isCorrect = parseInt(studentAnswers.commonDenominator) === den1 * den2;
        message = isCorrect ? 'Correct! The common denominator is the product of both denominators.' 
                           : 'Try again. Multiply the two denominators together.';
        break;
      case 1: // Adjusted numerators
        const correctNum1 = num1 * den2;
        const correctNum2 = num2 * den1;
        isCorrect = parseInt(studentAnswers.adjustedNumerator1) === correctNum1 && 
                   parseInt(studentAnswers.adjustedNumerator2) === correctNum2;
        message = isCorrect ? 'Correct! You multiplied each numerator by the other denominator.' 
                           : 'Try again. Multiply each numerator by the other denominator.';
        break;
      case 2: // Sum numerators
        isCorrect = parseInt(studentAnswers.sumNumerator) === (num1 * den2 + num2 * den1);
        message = isCorrect ? 'Correct! You added the adjusted numerators.' 
                           : 'Try again. Add the two adjusted numerators together.';
        break;
      case 3: // Simplified fraction
        const gcd = findGCD(result.steps.sumNumerator, result.steps.commonDenominator);
        isCorrect = parseInt(studentAnswers.simplifiedNumerator) === result.steps.sumNumerator / gcd &&
                   parseInt(studentAnswers.simplifiedDenominator) === result.steps.commonDenominator / gcd;
        if (isCorrect) {
          message = 'Correct! You simplified the fraction correctly.';
          setIsComplete(true);
          setAnimationKey(prev => prev + 1);
        } else {
          message = 'Try again. Find the greatest common divisor and divide both numbers by it.';
        }
        break;
    }

    setFeedback(message);
    if (isCorrect && currentStep < 3) {
      setShowNextButton(true);
    }
  };

  const findGCD = (a, b) => {
    return b === 0 ? a : findGCD(b, a % b);
  };

  const generatePieData = (numerator, denominator) => {
    const value = numerator / denominator;
    const filledSlices = Math.floor(value * denominator);
    const data = [];
    
    for (let i = 0; i < denominator; i++) {
      data.push({
        value: 1,
        filled: i < filledSlices
      });
    }
    
    return data;
  };

  const renderPieChart = (numerator, denominator, delay = 0) => (
    <PieChart width={150} height={150} style={{ userSelect: 'none' }}>
      <Pie
        data={generatePieData(numerator, denominator)}
        cx={75}
        cy={75}
        innerRadius={0}
        outerRadius={60}
        dataKey="value"
        isAnimationActive={true}
        animationBegin={delay}
        animationDuration={800}
        focusable={false}
      >
        {generatePieData(numerator, denominator).map((entry, index) => (
          <Cell 
            key={`cell-${index}`} 
            fill={entry.filled ? COLORS[0] : COLORS[1]} 
            style={{ outline: 'none' }}
          />
        ))}
      </Pie>
    </PieChart>
  );

  const COLORS = ['#0088FE', '#FFFFFF'];

  const renderStepContent = () => {
    const f1 = droppedFractions[0];
    const f2 = droppedFractions[1];
    
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <p>Find the common denominator for {f1.numerator}/{f1.denominator} and {f2.numerator}/{f2.denominator}</p>
            <div className="input-with-label">
              <span>Common denominator:</span>
              <input
                type="number"
                value={studentAnswers.commonDenominator}
                onChange={(e) => handleStudentAnswerChange('commonDenominator', e.target.value)}
              />
            </div>
            {!feedback.includes('Correct!') && (
              <button className="check-button" onClick={checkAnswer}>
                Check Answer
              </button>
            )}
            {feedback && (
              <div className="feedback-container">
                <p className={`feedback ${feedback.includes('Correct!') ? 'correct' : 'incorrect'}`}>{feedback}</p>
                {feedback.includes('Correct!') && (
                  <button className="next-button" onClick={handleNextStep}>
                    Next Step →
                  </button>
                )}
              </div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="step-content">
            <p>Adjust the numerators using the common denominator</p>
            <div className="adjusted-numerators">
              <div className="input-with-label">
                <span>First numerator</span>
                <input
                  type="number"
                  value={studentAnswers.adjustedNumerator1}
                  onChange={(e) => handleStudentAnswerChange('adjustedNumerator1', e.target.value)}
                />
                <div className="denominator">/20</div>
              </div>
              <span>+</span>
              <div className="input-with-label">
                <span>Second numerator</span>
                <input
                  type="number"
                  value={studentAnswers.adjustedNumerator2}
                  onChange={(e) => handleStudentAnswerChange('adjustedNumerator2', e.target.value)}
                />
                <div className="denominator">/20</div>
              </div>
            </div>
            {!feedback.includes('Correct!') && (
              <button className="check-button" onClick={checkAnswer}>
                Check Answer
              </button>
            )}
            {feedback && (
              <div className="feedback-container">
                <p className={`feedback ${feedback.includes('Correct!') ? 'correct' : 'incorrect'}`}>{feedback}</p>
                {feedback.includes('Correct!') && (
                  <button className="next-button" onClick={handleNextStep}>
                    Next Step →
                  </button>
                )}
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <p>Add the adjusted numerators</p>
            <div className="sum-numerator-container">
              <label>Sum of numerators:</label>
              <div className="sum-fraction-input">
                <input
                  type="number"
                  value={studentAnswers.sumNumerator}
                  onChange={(e) => handleStudentAnswerChange('sumNumerator', e.target.value)}
                /><span>/{result.steps.commonDenominator}</span>
              </div>
            </div>
            {!feedback.includes('Correct!') && (
              <button className="check-button" onClick={checkAnswer}>
                Check Answer
              </button>
            )}
            {feedback && (
              <div className="feedback-container">
                <p className={`feedback ${feedback.includes('Correct!') ? 'correct' : 'incorrect'}`}>{feedback}</p>
                {feedback.includes('Correct!') && (
                  <button className="next-button" onClick={handleNextStep}>
                    Next Step →
                  </button>
                )}
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <p>Simplify the fraction {result.steps.sumNumerator}/{result.steps.commonDenominator}</p>
            <div className="simplified-fraction">
              <div className="input-with-label">
                <span>Simplified numerator:</span>
                <input
                  type="number"
                  value={studentAnswers.simplifiedNumerator}
                  onChange={(e) => handleStudentAnswerChange('simplifiedNumerator', e.target.value)}
                />
              </div>
              <div className="fraction-divider">/</div>
              <div className="input-with-label">
                <span>Simplified denominator:</span>
                <input
                  type="number"
                  value={studentAnswers.simplifiedDenominator}
                  onChange={(e) => handleStudentAnswerChange('simplifiedDenominator', e.target.value)}
                />
              </div>
            </div>
            {!isComplete && !feedback.includes('Correct!') && (
              <button className="check-button" onClick={checkAnswer}>
                Check Answer
              </button>
            )}
            {feedback && !isComplete && (
              <div className="feedback-container">
                <p className={`feedback ${feedback.includes('Correct!') ? 'correct' : 'incorrect'}`}>{feedback}</p>
              </div>
            )}
            {isComplete && (
              <div className="final-result" key={animationKey}>
                <p className="feedback correct">Correct!</p>
                <h3>Final Result: {result.numerator}/{result.denominator}</h3>
                <div className="student-steps">
                  <h4>Your Steps:</h4>
                  <div className="step-animation" style={{ animationDelay: '0s' }}>
                    <p>1. Common Denominator: {studentAnswers.commonDenominator}</p>
                  </div>
                  <div className="step-animation" style={{ animationDelay: '0.2s' }}>
                    <p>2. Adjusted Fractions: {studentAnswers.adjustedNumerator1}/{result.steps.commonDenominator} + {studentAnswers.adjustedNumerator2}/{result.steps.commonDenominator}</p>
                  </div>
                  <div className="step-animation" style={{ animationDelay: '0.4s' }}>
                    <p>3. Sum: {studentAnswers.sumNumerator}/{result.steps.commonDenominator}</p>
                  </div>
                  <div className="step-animation" style={{ animationDelay: '0.6s' }}>
                    <p>4. Simplified: {studentAnswers.simplifiedNumerator}/{studentAnswers.simplifiedDenominator}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fraction-addition-container">
      <h2 className="title">Fraction Addition</h2>
      {!showResult && (
        <>
          <p className="instructions">Enter two fractions and drag them to visualize the addition</p>
          <div className="input-section">
            <div className="fraction-input-group">
              <label className="fraction-label">First Fraction</label>
              <div className="fraction-input">
                <div className="input-with-label">
                  <span>Numerator:</span>
                  <input
                    type="number"
                    value={fractions.fraction1.numerator}
                    onChange={(e) => handleInputChange('fraction1', 'numerator', e.target.value)}
                    disabled={fractionsLocked}
                  />
                </div>
                <div className="fraction-line"></div>
                <div className="input-with-label">
                  <span>Denominator:</span>
                  <input
                    type="number"
                    value={fractions.fraction1.denominator}
                    onChange={(e) => handleInputChange('fraction1', 'denominator', e.target.value)}
                    disabled={fractionsLocked}
                  />
                </div>
              </div>
            </div>
            <span className="plus-sign">+</span>
            <div className="fraction-input-group">
              <label className="fraction-label">Second Fraction</label>
              <div className="fraction-input">
                <div className="input-with-label">
                  <span>Numerator:</span>
                  <input
                    type="number"
                    value={fractions.fraction2.numerator}
                    onChange={(e) => handleInputChange('fraction2', 'numerator', e.target.value)}
                    disabled={fractionsLocked}
                  />
                </div>
                <div className="fraction-line"></div>
                <div className="input-with-label">
                  <span>Denominator:</span>
                  <input
                    type="number"
                    value={fractions.fraction2.denominator}
                    onChange={(e) => handleInputChange('fraction2', 'denominator', e.target.value)}
                    disabled={fractionsLocked}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="fractions-to-drag">
            {Object.entries(fractions).map(([key, fraction]) => (
              <div key={key} className="drag-source">
                {fraction.numerator && fraction.denominator && (
                  <div
                    className="draggable-fraction"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragEnd={handleDragEnd}
                  >
                    {fraction.numerator}/{fraction.denominator}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="drag-drop-section">
        <div 
          className="drop-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {droppedFractions.length > 0 && (
            <div className="fractions-display">
              {droppedFractions.map((fraction, index) => (
                <div key={index} className="dropped-fraction">
                  <div className="fraction-display">
                    {fraction.numerator}/{fraction.denominator}
                  </div>
                  <div className="pie-chart-container">
                    <PieChart width={100} height={100} style={{ userSelect: 'none' }}>
                      <Pie
                        data={generatePieData(fraction.numerator, fraction.denominator)}
                        cx={50}
                        cy={50}
                        innerRadius={0}
                        outerRadius={40}
                        dataKey="value"
                        isAnimationActive={true}
                        animationBegin={index * 200}
                        animationDuration={1000}
                        focusable={false}
                      >
                        {generatePieData(fraction.numerator, fraction.denominator).map((entry, i) => (
                          <Cell 
                            key={`cell-${i}`} 
                            fill={entry.filled ? COLORS[0] : COLORS[1]} 
                            style={{ outline: 'none' }}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </div>
                </div>
              ))}
            </div>
          )}
          {droppedFractions.length === 2 && !showResult && (
            <button className="add-button" onClick={calculateSum}>
              Add Fractions
            </button>
          )}
          {showResult && result && (
            <div className="result-display">
              {!isComplete && (
                <div className={`step ${stepAnimation}`}>
                  {renderStepContent()}
                </div>
              )}
              {isComplete && (
                <div className="final-result" key={animationKey}>
                  <p className="feedback correct">Correct!</p>
                  <h3>Final Result: {result.numerator}/{result.denominator}</h3>
                  <div className="student-steps">
                    <h4>Your Steps:</h4>
                    <div className="step-animation" style={{ animationDelay: '0s' }}>
                      <p>1. Common Denominator: {studentAnswers.commonDenominator}</p>
                    </div>
                    <div className="step-animation" style={{ animationDelay: '0.2s' }}>
                      <p>2. Adjusted Fractions: {studentAnswers.adjustedNumerator1}/{result.steps.commonDenominator} + {studentAnswers.adjustedNumerator2}/{result.steps.commonDenominator}</p>
                    </div>
                    <div className="step-animation" style={{ animationDelay: '0.4s' }}>
                      <p>3. Sum: {studentAnswers.sumNumerator}/{result.steps.commonDenominator}</p>
                    </div>
                    <div className="step-animation" style={{ animationDelay: '0.6s' }}>
                      <p>4. Simplified: {studentAnswers.simplifiedNumerator}/{studentAnswers.simplifiedDenominator}</p>
                    </div>
                  </div>
                  <div className="pie-charts-container">
                    <PieChart width={150} height={150} style={{ userSelect: 'none' }}>
                      <Pie
                        data={generatePieData(result.numerator, result.denominator)}
                        cx={75}
                        cy={75}
                        innerRadius={0}
                        outerRadius={60}
                        dataKey="value"
                        isAnimationActive={true}
                        animationBegin={800}
                        animationDuration={1000}
                        focusable={false}
                      >
                        {generatePieData(result.numerator, result.denominator).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.filled ? COLORS[0] : COLORS[1]} 
                            style={{ outline: 'none' }}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <button className="reset-button" onClick={resetAll}>
        Reset
      </button>
    </div>
  );
};

export default FractionAddition; 