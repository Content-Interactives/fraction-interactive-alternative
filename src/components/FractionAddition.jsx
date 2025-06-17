import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import './FractionAddition.css';
import '../assets/orbit-glow-button/orbit-glow-button.css';

// Helper component for algebraic fraction notation
const Fraction = ({ numerator, denominator, size = '1.2em' }) => (
  <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: size, lineHeight: 1, verticalAlign: 'middle' }}>
    <span style={{ display: 'block', fontWeight: 500, color: '#23205B' }}>{numerator}</span>
    <span style={{ display: 'block', borderTop: '2px solid #5750E3', width: '100%', margin: '0 auto' }}></span>
    <span style={{ display: 'block', fontWeight: 500, color: '#23205B' }}>{denominator}</span>
  </span>
);

// Helper to render a mixed number if improper
const MixedFraction = ({ numerator, denominator, size = '1.7em' }) => {
  if (numerator < denominator) {
    return <Fraction numerator={numerator} denominator={denominator} size={size} />;
  }
  const whole = Math.floor(numerator / denominator);
  const remainder = numerator % denominator;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: size }}>
      <span style={{ marginRight: '0.2em', fontWeight: 500, color: '#23205B' }}>{whole}</span>
      {remainder > 0 && <Fraction numerator={remainder} denominator={denominator} size={`calc(${size} * 0.8)`} />}
    </span>
  );
};

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
  const [animatedDenominator1, setAnimatedDenominator1] = useState(null);
  const [animatedDenominator2, setAnimatedDenominator2] = useState(null);
  const [isAnimatingDenominator, setIsAnimatingDenominator] = useState(false);
  const [step1Visible, setStep1Visible] = useState(false);
  const [step2Visible, setStep2Visible] = useState(false);
  const [animatedNumerator1, setAnimatedNumerator1] = useState(null);
  const [animatedNumerator2, setAnimatedNumerator2] = useState(null);
  const [step3AnimatedNumerator1, setStep3AnimatedNumerator1] = useState(null);
  const [step3AnimatedNumerator2, setStep3AnimatedNumerator2] = useState(null);
  const [hideContinue, setHideContinue] = useState(false);
  const [step2ShadeNumerator1, setStep2ShadeNumerator1] = useState(0);
  const [step2ShadeNumerator2, setStep2ShadeNumerator2] = useState(0);
  const [step2ShadeNumerator1Float, setStep2ShadeNumerator1Float] = useState(0);
  const [step2ShadeNumerator2Float, setStep2ShadeNumerator2Float] = useState(0);
  const [step2NumeratorAnimationDone, setStep2NumeratorAnimationDone] = useState(false);

  useEffect(() => {
    // Trigger step animation when currentStep changes
    setStepAnimation('step-exit');
    const timer = setTimeout(() => {
      setStepAnimation('step-enter');
    }, 50);
    // Fade in Step 1
    if (currentStep === 0 && showSteps) {
      setStep1Visible(false);
      setTimeout(() => setStep1Visible(true), 50);
    }
    // Fade in Step 2
    if (currentStep === 1 && showSteps) {
      setStep2Visible(false);
      setTimeout(() => setStep2Visible(true), 50);
    }
    return () => clearTimeout(timer);
  }, [currentStep, showSteps]);

  // When step or fractions change, reset animated denominators
  useEffect(() => {
    if (currentStep === 0 && showSteps) {
      setAnimatedDenominator1(fractions.fraction1.denominator);
      setAnimatedDenominator2(fractions.fraction2.denominator);
    }
  }, [currentStep, showSteps, fractions.fraction1.denominator, fractions.fraction2.denominator]);

  // Animate numerators and denominators together in the new combined step (now Step 2)
  useEffect(() => {
    if (currentStep === 1 && showSteps && step2Visible) {
      const delay = setTimeout(() => {
        setIsAnimatingDenominator(true);
        const startDen1 = parseInt(fractions.fraction1.denominator);
        const startDen2 = parseInt(fractions.fraction2.denominator);
        const startNum1 = parseInt(fractions.fraction1.numerator);
        const startNum2 = parseInt(fractions.fraction2.numerator);
        const targetDen = result.steps.commonDenominator;
        const targetNum1 = result.steps.adjustedNumerator1;
        const targetNum2 = result.steps.adjustedNumerator2;
        let d1 = startDen1;
        let d2 = startDen2;
        let n1 = startNum1;
        let n2 = startNum2;
        const interval = 200;
        const animate = () => {
          let changed = false;
          if (d1 < targetDen) { d1++; changed = true; }
          if (d2 < targetDen) { d2++; changed = true; }
          // Animate numerators proportionally
          let newN1 = Math.round(startNum1 * d1 / startDen1);
          let newN2 = Math.round(startNum2 * d2 / startDen2);
          // When denominator reaches target, set to adjusted numerator
          if (d1 === targetDen) newN1 = targetNum1;
          if (d2 === targetDen) newN2 = targetNum2;
          setAnimatedDenominator1(d1);
          setAnimatedDenominator2(d2);
          setAnimatedNumerator1(newN1);
          setAnimatedNumerator2(newN2);
          if (changed) {
            setTimeout(animate, interval);
          } else {
            setIsAnimatingDenominator(false);
            setHideContinue(false); // Show Continue button after animation
          }
        };
        animate();
      }, 1000); // 1 second delay
      return () => clearTimeout(delay);
    }
  }, [currentStep, showSteps, step2Visible]);

  // Fade in Step 3 and animate numerators
  useEffect(() => {
    if (currentStep === 2 && showSteps) {
      setStep3AnimatedNumerator1(fractions.fraction1.numerator);
      setStep3AnimatedNumerator2(fractions.fraction2.numerator);
      setTimeout(() => {
        // Animate numerators after 1s delay
        setTimeout(() => {
          const startNum1 = parseInt(fractions.fraction1.numerator);
          const startNum2 = parseInt(fractions.fraction2.numerator);
          const targetNum1 = result.steps.adjustedNumerator1;
          const targetNum2 = result.steps.adjustedNumerator2;
          let n1 = startNum1;
          let n2 = startNum2;
          const interval = 200;
          const animate = () => {
            let changed = false;
            if (n1 < targetNum1) { n1++; changed = true; }
            if (n2 < targetNum2) { n2++; changed = true; }
            setStep3AnimatedNumerator1(n1);
            setStep3AnimatedNumerator2(n2);
            if (changed) {
              setTimeout(animate, interval);
            } else {
              setHideContinue(false); // Show Continue button after animation in Step 3
            }
          };
          animate();
        }, 1000); // 1 second delay after fade-in
      }, 50);
    }
  }, [currentStep, showSteps]);

  // Smoothly animate numerator shading after denominator animation completes
  useEffect(() => {
    if (
      currentStep === 1 &&
      showSteps &&
      animatedDenominator1 === result?.steps?.commonDenominator &&
      animatedDenominator2 === result?.steps?.commonDenominator
    ) {
      setStep2ShadeNumerator1Float(0);
      setStep2ShadeNumerator2Float(0);
      setStep2NumeratorAnimationDone(false);
      const targetNum1 = result.steps.adjustedNumerator1;
      const targetNum2 = result.steps.adjustedNumerator2;
      const duration = 1200; // ms for each fill
      const delay = setTimeout(() => {
        // Animate first numerator
        let start = null;
        function animateFirst(ts) {
          if (!start) start = ts;
          const elapsed = ts - start;
          const progress = Math.min(elapsed / duration, 1);
          setStep2ShadeNumerator1Float(progress * targetNum1);
          if (progress < 1) {
            requestAnimationFrame(animateFirst);
          } else {
            // Animate second numerator after first is done
            let start2 = null;
            function animateSecond(ts2) {
              if (!start2) start2 = ts2;
              const elapsed2 = ts2 - start2;
              const progress2 = Math.min(elapsed2 / duration, 1);
              setStep2ShadeNumerator2Float(progress2 * targetNum2);
              if (progress2 < 1) {
                requestAnimationFrame(animateSecond);
              } else {
                setStep2NumeratorAnimationDone(true);
              }
            }
            requestAnimationFrame(animateSecond);
          }
        }
        requestAnimationFrame(animateFirst);
      }, 1000); // 1 second delay before numerator animation
      return () => clearTimeout(delay);
    }
    // Reset on step change
    if (currentStep !== 1) {
      setStep2ShadeNumerator1Float(0);
      setStep2ShadeNumerator2Float(0);
      setStep2NumeratorAnimationDone(false);
    }
  }, [currentStep, showSteps, animatedDenominator1, animatedDenominator2, result]);

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
    setStep1Visible(false);
    setStep2Visible(false);
    setHideContinue(false);
    setAnimatedDenominator1(null);
    setAnimatedDenominator2(null);
    setAnimatedNumerator1(null);
    setAnimatedNumerator2(null);
    setStep3AnimatedNumerator1(null);
    setStep3AnimatedNumerator2(null);
    setStep2ShadeNumerator1(0);
    setStep2ShadeNumerator2(0);
    setStep2ShadeNumerator1Float(0);
    setStep2ShadeNumerator2Float(0);
    setStep2NumeratorAnimationDone(false);
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
    if (currentStep === 0 && result) {
      setHideContinue(true); // Hide Continue button immediately
      setCurrentStep(currentStep + 1); // Go to step 2, let fade-in and pie animation handle next
      return;
    }
    if (currentStep === 1 && result) {
      setHideContinue(true); // Hide Continue button immediately for Step 2
      setCurrentStep(currentStep + 1);
      return;
    }
    setStepAnimation('step-exit');
    setTimeout(() => {
      if (currentStep < 4) {
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

  const generatePieData = (numerator, denominator, staticFillFraction = null, smoothFill = false) => {
    // If staticFillFraction is provided, use it for filled slices
    const fillFraction = staticFillFraction !== null ? staticFillFraction : numerator / denominator;
    const data = [];
    if (smoothFill) {
      const intPart = Math.floor(numerator);
      const fracPart = numerator - intPart;
      for (let i = 0; i < denominator; i++) {
        if (i < intPart) {
          data.push({ value: 1, filled: true, partial: 1 });
        } else if (i === intPart && fracPart > 0) {
          data.push({ value: 1, filled: true, partial: fracPart });
        } else {
          data.push({ value: 1, filled: false, partial: 0 });
        }
      }
    } else {
      const filledSlices = Math.round(fillFraction * denominator);
      for (let i = 0; i < denominator; i++) {
        data.push({ value: 1, filled: i < filledSlices });
      }
    }
    return data;
  };

  const COLORS = ['#5750E3', '#FFFFFF'];
  const OUTLINE_COLOR = '#3D389F';

  const renderStepContent = () => {
    const f1 = fractions.fraction1;
    const f2 = fractions.fraction2;
    const pieStepStyle = { marginLeft: '40px' };
    switch (currentStep) {
      case 0:
        return (
          <div className={`step-content fade-in-step1${step1Visible ? '' : ' fade-in-step1-hidden'}`}>
            <h3>Step 1: Find a common denominator</h3>
            <div className="fraction-sum-row" style={{ marginTop: 16 }}>
              <Fraction numerator={f1.numerator} denominator={f1.denominator} size="1.5em" />
              <span className="plus-centered">+</span>
              <Fraction numerator={f2.numerator} denominator={f2.denominator} size="1.5em" />
            </div>
            <div className="pie-charts-container" style={{ justifyContent: 'center', marginTop: '20px', ...pieStepStyle }}>
              <div className="pie-charts-flex">
                <div className="pie-chart">
                  {renderPieChart(f1.numerator, f1.denominator)}
                </div>
                <div className="pie-chart">
                  {renderPieChart(f2.numerator, f2.denominator)}
                </div>
              </div>
            </div>
          </div>
        );
      case 1:
        // No shading during denominator animation; animate numerator shading after
        const showAdjustedNumerator1 = animatedDenominator1 === result.steps.commonDenominator;
        const showAdjustedNumerator2 = animatedDenominator2 === result.steps.commonDenominator;
        // Determine what to show in the equation numerator
        let displayNumeratorEq1 = f1.numerator;
        let displayNumeratorEq2 = f2.numerator;
        if (showAdjustedNumerator1) {
          // Only start showing the adjusted numerator when shading animation has actually started
          if (step2ShadeNumerator1Float >= 1) {
            displayNumeratorEq1 = Math.floor(step2ShadeNumerator1Float);
          } else {
            // Keep showing original numerator until shading starts
            displayNumeratorEq1 = f1.numerator;
          }
        }
        if (showAdjustedNumerator2) {
          // Only start showing the adjusted numerator when shading animation has actually started
          if (step2ShadeNumerator2Float >= 1) {
            displayNumeratorEq2 = Math.floor(step2ShadeNumerator2Float);
          } else {
            // Keep showing original numerator until shading starts
            displayNumeratorEq2 = f2.numerator;
          }
        }
        return (
          <div className={`step-content fade-in-step2${step2Visible ? '' : ' fade-in-step2-hidden'}`}>
            <h3>Step 2: Rewrite with common denominator and adjust numerators</h3>
            <div className="adjusted-fractions fraction-sum-row">
              <span><Fraction numerator={displayNumeratorEq1} denominator={animatedDenominator1 || f1.denominator} /></span>
              <span className="plus-centered">+</span>
              <span><Fraction numerator={displayNumeratorEq2} denominator={animatedDenominator2 || f2.denominator} /></span>
            </div>
            <div className="pie-charts-container" style={{ justifyContent: 'center', marginTop: '20px', ...pieStepStyle }}>
              <div className="pie-charts-flex">
                <div className="pie-chart">
                  {renderPieChart(
                    showAdjustedNumerator1 ? step2ShadeNumerator1Float : 0,
                    animatedDenominator1 || result.steps.commonDenominator,
                    null,
                    showAdjustedNumerator1
                  )}
                </div>
                <div className="pie-chart">
                  {renderPieChart(
                    showAdjustedNumerator2 ? step2ShadeNumerator2Float : 0,
                    animatedDenominator2 || result.steps.commonDenominator,
                    null,
                    showAdjustedNumerator2
                  )}
                </div>
              </div>
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
            <div className="pie-charts-container" style={{ justifyContent: 'center', marginTop: '20px', ...pieStepStyle }}>
              {renderImproperPieCharts(result.steps.sumNumerator, result.steps.commonDenominator)}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <h3>Step 4: Simplify if possible</h3>
            <div className="simplified-fraction">
              <span className="final-answer"><MixedFraction numerator={result.numerator} denominator={result.denominator} size="1.7em" /></span>
            </div>
            <div className="pie-charts-container" style={{ justifyContent: 'center', marginTop: '20px', ...pieStepStyle }}>
              {renderImproperPieCharts(result.numerator, result.denominator)}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPieChart = (numerator, denominator, staticFillFraction = null, smoothFill = false) => {
    const pieData = generatePieData(numerator, denominator, staticFillFraction, smoothFill);
    return (
      <PieChart width={150} height={150} style={{ userSelect: 'none' }}>
        <Pie
          data={pieData}
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
          {pieData.map((entry, index) => {
            // For the partial slice, animate the fill color's opacity, but always render unfilled slices as white
            let fill = entry.filled ? COLORS[0] : COLORS[1];
            let style = { outline: 'none' };
            if (smoothFill && entry.filled && entry.partial !== undefined && entry.partial < 1) {
              style.opacity = entry.partial;
            } else {
              style.opacity = 1;
            }
            return (
              <Cell
                key={`cell-${index}`}
                fill={fill}
                stroke={OUTLINE_COLOR}
                strokeWidth={2.5}
                style={style}
              />
            );
          })}
        </Pie>
      </PieChart>
    );
  };

  // Helper to render multiple pie charts for improper fractions
  const renderImproperPieCharts = (numerator, denominator) => {
    if (numerator <= denominator) {
      // Proper fraction: just one pie chart
      return (
        <div className="pie-charts-flex">
          <div className="pie-chart">
            {renderPieChart(numerator, denominator)}
          </div>
        </div>
      );
    }
    // Improper: show one pie for each whole, and one for the remainder if any
    const pies = [];
    const whole = Math.floor(numerator / denominator);
    const remainder = numerator % denominator;
    for (let i = 0; i < whole; i++) {
      pies.push(
        <div className="pie-chart" key={i}>
          {renderPieChart(denominator, denominator)}
        </div>
      );
    }
    if (remainder > 0) {
      pies.push(
        <div className="pie-chart" key={whole}>
          {renderPieChart(remainder, denominator)}
        </div>
      );
    }
    return <div className="pie-charts-flex">{pies}</div>;
  };

  return (
    <div className="fraction-addition-container">
      <div className="content-inner">
        <h2 className="title">Fraction Addition</h2>
        {!showSteps ? (
          <>
            <p className="instructions">Enter two fractions to see how to add them step by step</p>
            <div className="input-section">
              <div className="fraction-input-group">
                <label className="fraction-label">First Fraction</label>
                <div className="fraction-input">
                  <div className="input-with-label">
                    <span style={{ marginRight: '6px' }}>Numerator: </span>
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
                    <span style={{ marginRight: '6px' }}>Denominator: </span>
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
                    <span style={{ marginRight: '6px' }}>Numerator: </span>
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
                    <span style={{ marginRight: '6px' }}>Denominator: </span>
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
            <div className="fraction-pie-row">
              {fractions.fraction1.numerator && fractions.fraction1.denominator && (
                <div className="fraction-cell">
                  <Fraction numerator={fractions.fraction1.numerator} denominator={fractions.fraction1.denominator} />
                </div>
              )}
              {fractions.fraction1.numerator && fractions.fraction1.denominator && (
                <div className="pie-chart">
                  {renderPieChart(fractions.fraction1.numerator, fractions.fraction1.denominator)}
                </div>
              )}
              {fractions.fraction2.numerator && fractions.fraction2.denominator && (
                <div className="pie-chart">
                  {renderPieChart(fractions.fraction2.numerator, fractions.fraction2.denominator)}
                </div>
              )}
              {fractions.fraction2.numerator && fractions.fraction2.denominator && (
                <div className="fraction-cell">
                  <Fraction numerator={fractions.fraction2.numerator} denominator={fractions.fraction2.denominator} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="steps-container">
            {!isComplete && (
              <div className={`step ${stepAnimation}`} style={{ background: 'none', boxShadow: 'none', padding: 0 }}>
                {renderStepContent()}
              </div>
            )}
            {isComplete && (
              <div className="final-result" key={animationKey}>
                <h3>Fraction Addition Complete!</h3>
                <p>You've successfully added {fractions.fraction1.numerator}/{fractions.fraction1.denominator} and {fractions.fraction2.numerator}/{fractions.fraction2.denominator}</p>
                <p className="final-answer"><MixedFraction numerator={result.numerator} denominator={result.denominator} size="1.7em" /></p>
                <div className="pie-charts-container" style={{ justifyContent: 'center' }}>
                  {renderImproperPieCharts(result.numerator, result.denominator)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Button bar at the bottom left */}
      <div className="button-bar">
        <button className="reset-button" onClick={resetAll}>
          Reset
        </button>
        {(fractions.fraction1.numerator && fractions.fraction1.denominator &&
          fractions.fraction2.numerator && fractions.fraction2.denominator &&
          (!showSteps || (showSteps && !isComplete)) &&
          !isAnimatingDenominator &&
          !hideContinue &&
          (currentStep !== 1 || step2NumeratorAnimationDone)) && (
            <button
              className="glow-button simple-glow button-bar-right"
              onClick={!showSteps ? startSteps : handleNextStep}
            >
              {showSteps && !isComplete && currentStep >= 3 ? 'Finish' : 'Continue'}
            </button>
          )}
      </div>
    </div>
  );
};

export default FractionAddition; 