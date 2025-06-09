import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import './FractionAddition.css';

// Helper component for algebraic fraction notation
const Fraction = ({ numerator, denominator, size = '1.2em' }) => (
  <span style={{ display: 'inline-block', textAlign: 'center', fontSize: size, lineHeight: 1 }}>
    <span style={{ display: 'block', fontWeight: 500 }}>{numerator}</span>
    <span style={{ display: 'block', borderTop: '2px solid #0088FE', width: '100%', margin: '0 auto' }}></span>
    <span style={{ display: 'block', fontWeight: 500 }}>{denominator}</span>
  </span>
);

const FractionAddition = () => {
  const [fractions, setFractions] = useState({
    fraction1: { numerator: '', denominator: '' },
    fraction2: { numerator: '', denominator: '' }
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [showSteps, setShowSteps] = useState(false);
  const [result, setResult] = useState(null);
  const [stepAnimation, setStepAnimation] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    // Trigger step animation when currentStep changes
    setStepAnimation('step-exit');
    const timer = setTimeout(() => {
      setStepAnimation('step-enter');
    }, 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleInputChange = (fractionKey, part, value) => {
    if (showSteps) return;
    
    // Convert to number and validate
    let numValue = parseInt(value) || '';
    
    // Ensure value is between 1 and 10
    if (numValue !== '') {
      numValue = Math.max(1, Math.min(10, numValue));
    }
    
    setFractions(prev => ({
      ...prev,
      [fractionKey]: {
        ...prev[fractionKey],
        [part]: numValue
      }
    }));
  };

  const resetAll = () => {
    setFractions({
      fraction1: { numerator: '', denominator: '' },
      fraction2: { numerator: '', denominator: '' }
    });
    setCurrentStep(0);
    setShowSteps(false);
    setResult(null);
    setIsComplete(false);
  };

  const startSteps = () => {
    const f1 = fractions.fraction1;
    const f2 = fractions.fraction2;
    
    const num1 = parseInt(f1.numerator);
    const den1 = parseInt(f1.denominator);
    const num2 = parseInt(f2.numerator);
    const den2 = parseInt(f2.denominator);
    
    // Find least common multiple for denominator
    const commonDen = findLCM(den1, den2);
    const factor1 = commonDen / den1;
    const factor2 = commonDen / den2;
    const newNum1 = num1 * factor1;
    const newNum2 = num2 * factor2;
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
    setShowSteps(true);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    setStepAnimation('step-exit');
    setTimeout(() => {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsComplete(true);
      }
      setAnimationKey(prev => prev + 1);
    }, 500);
  };

  const findGCD = (a, b) => {
    return b === 0 ? a : findGCD(b, a % b);
  };

  const findLCM = (a, b) => {
    return (a * b) / findGCD(a, b);
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

  const COLORS = ['#0088FE', '#FFFFFF'];
  const OUTLINE_COLOR = '#1565c0';

  const renderStepContent = () => {
    const f1 = fractions.fraction1;
    const f2 = fractions.fraction2;
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <h3>Step 1: Find a common denominator</h3>
            <div className="fraction-sum-row" style={{ marginTop: 16 }}>
              <Fraction numerator={f1.numerator} denominator={f1.denominator} size="1.5em" />
              <span className="plus-centered">+</span>
              <Fraction numerator={f2.numerator} denominator={f2.denominator} size="1.5em" />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="step-content">
            <h3>Step 2: Rewrite with common denominator</h3>
            <div className="adjusted-fractions fraction-sum-row">
              <span><Fraction numerator={result.steps.adjustedNumerator1} denominator={result.steps.commonDenominator} /></span>
              <span className="plus-centered">+</span>
              <span><Fraction numerator={result.steps.adjustedNumerator2} denominator={result.steps.commonDenominator} /></span>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <h3>Step 3: Add the numerators</h3>
            <div className="sum-fraction">
              <Fraction numerator={result.steps.sumNumerator} denominator={result.steps.commonDenominator} size="1.5em" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <h3>Step 4: Simplify if possible</h3>
            <div className="simplified-fraction">
              <span className="final-answer"><Fraction numerator={result.numerator} denominator={result.denominator} size="1.7em" /></span>
            </div>
            <div className="pie-charts-container">
              <div className="pie-chart">
                {renderPieChart(result.numerator, result.denominator)}
                <span><Fraction numerator={result.numerator} denominator={result.denominator} /></span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPieChart = (numerator, denominator) => (
    <PieChart width={150} height={150} style={{ userSelect: 'none' }}>
      <Pie
        data={generatePieData(numerator, denominator)}
        cx={75}
        cy={75}
        innerRadius={0}
        outerRadius={60}
        dataKey="value"
        isAnimationActive={true}
        animationDuration={800}
        focusable={false}
        stroke={OUTLINE_COLOR}
        strokeWidth={3}
      >
        {generatePieData(numerator, denominator).map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={entry.filled ? COLORS[0] : COLORS[1]}
            stroke={OUTLINE_COLOR}
            strokeWidth={2.5}
            style={{ outline: 'none' }}
          />
        ))}
      </Pie>
    </PieChart>
  );

  return (
    <div className="fraction-addition-container">
      <h2 className="title">Fraction Addition</h2>
      {!showSteps ? (
        <>
          <p className="instructions">Enter two fractions to see how to add them step by step</p>
          <div className="input-section">
            <div className="fraction-input-group">
              <label className="fraction-label">First Fraction</label>
              <div className="fraction-input">
                <div className="input-with-label">
                  <span>Numerator:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={fractions.fraction1.numerator}
                    onChange={(e) => handleInputChange('fraction1', 'numerator', e.target.value)}
                  />
                </div>
                <div className="fraction-line"></div>
                <div className="input-with-label">
                  <span>Denominator:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={fractions.fraction1.denominator}
                    onChange={(e) => handleInputChange('fraction1', 'denominator', e.target.value)}
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
                    min="1"
                    max="10"
                    value={fractions.fraction2.numerator}
                    onChange={(e) => handleInputChange('fraction2', 'numerator', e.target.value)}
                  />
                </div>
                <div className="fraction-line"></div>
                <div className="input-with-label">
                  <span>Denominator:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={fractions.fraction2.denominator}
                    onChange={(e) => handleInputChange('fraction2', 'denominator', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Show pie charts and algebraic fractions dynamically as each fraction is entered */}
          <div className="prestep-pies">
            <div className="pie-charts-container">
              <div className="fraction-display">
                {fractions.fraction1.numerator && fractions.fraction1.denominator && (
                  <div className="pie-chart">
                    {renderPieChart(fractions.fraction1.numerator, fractions.fraction1.denominator)}
                    <span><Fraction numerator={fractions.fraction1.numerator} denominator={fractions.fraction1.denominator} /></span>
                  </div>
                )}
                {fractions.fraction2.numerator && fractions.fraction2.denominator && (
                  <div className="pie-chart">
                    {renderPieChart(fractions.fraction2.numerator, fractions.fraction2.denominator)}
                    <span><Fraction numerator={fractions.fraction2.numerator} denominator={fractions.fraction2.denominator} /></span>
                  </div>
                )}
              </div>
            </div>
            {fractions.fraction1.numerator && fractions.fraction1.denominator &&
             fractions.fraction2.numerator && fractions.fraction2.denominator && (
              <button 
                className="start-button" 
                onClick={startSteps}
                style={{ marginTop: 24 }}
              >
                Continue →
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="steps-container">
          {!isComplete && (
            <div className={`step ${stepAnimation}`}>
              {renderStepContent()}
              <button className="continue-button" onClick={handleNextStep}>
                {currentStep < 3 ? 'Continue →' : 'Finish'}
              </button>
            </div>
          )}
          {isComplete && (
            <div className="final-result" key={animationKey}>
              <h3>Fraction Addition Complete!</h3>
              <p>You've successfully added {fractions.fraction1.numerator}/{fractions.fraction1.denominator} and {fractions.fraction2.numerator}/{fractions.fraction2.denominator}</p>
              <p className="final-answer"><Fraction numerator={result.numerator} denominator={result.denominator} size="1.7em" /></p>
              <div className="pie-charts-container">
                <div className="pie-chart">
                  {renderPieChart(result.numerator, result.denominator)}
                  <span><Fraction numerator={result.numerator} denominator={result.denominator} /></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <button className="reset-button" onClick={resetAll}>
        Reset
      </button>
    </div>
  );
};

export default FractionAddition; 