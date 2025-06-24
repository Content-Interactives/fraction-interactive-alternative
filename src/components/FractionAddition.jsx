import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import './FractionAddition.css';
import '../assets/orbit-glow-button/orbit-glow-button.css';

// Helper component for algebraic fraction notation
const Fraction = ({ numerator, denominator, size = '1.2em', color = '#23205B', lineColor = '#5750E3' }) => (
  <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: size, lineHeight: 1, verticalAlign: 'middle' }}>
    <span style={{ display: 'block', fontWeight: 500, color }}>{numerator}</span>
    <span style={{ display: 'block', borderTop: `2px solid ${lineColor}`, width: '100%', margin: '0 auto' }}></span>
    <span style={{ display: 'block', fontWeight: 500, color }}>{denominator}</span>
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
  const [showCommonDenominator, setShowCommonDenominator] = useState(false);
  const [pieMoveDown, setPieMoveDown] = useState(false);
  const [showLCMText, setShowLCMText] = useState(false);
  const [showMultiplicationFactors, setShowMultiplicationFactors] = useState(false);
  const [showSumFraction, setShowSumFraction] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(true);
  // Factor fade-in states for step 2
  const [showBottomLeftFactor, setShowBottomLeftFactor] = useState(false);
  const [showBottomRightFactor, setShowBottomRightFactor] = useState(false);
  const [showTopLeftFactor, setShowTopLeftFactor] = useState(false);
  const [showTopRightFactor, setShowTopRightFactor] = useState(false);
  // Animation phase states for strict sequencing in step 2
  const [step2Phase, setStep2Phase] = useState(0); // 0: not started, 1: bottom factors, 2: denominator anim, 3: top left, 4: left numerator, 5: top right, 6: right numerator
  const [showLeftNumeratorFill, setShowLeftNumeratorFill] = useState(false);
  const [showRightNumeratorFill, setShowRightNumeratorFill] = useState(false);
  const [factorsVisible, setFactorsVisible] = useState(true);
  const [showSumInStep3, setShowSumInStep3] = useState(false);
  const resetButtonRef = useRef(null);

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
      setTimeout(() => setPieMoveDown(true), 1200);
      setTimeout(() => setShowCommonDenominator(true), 1500);
      setTimeout(() => setShowLCMText(true), 2000); // 0.5s after LCM space reserved
    }
    // Fade in Step 2
    if (currentStep === 1 && showSteps) {
      setStep2Visible(false);
      setTimeout(() => setStep2Visible(true), 50);
    }
    return () => {
      clearTimeout(timer);
      setShowLCMText(false);
    };
  }, [currentStep, showSteps]);

  // When step or fractions change, reset animated denominators
  useEffect(() => {
    if (currentStep === 0 && showSteps) {
      setAnimatedDenominator1(fractions.fraction1.denominator);
      setAnimatedDenominator2(fractions.fraction2.denominator);
    }
  }, [currentStep, showSteps, fractions.fraction1.denominator, fractions.fraction2.denominator]);

  // Reset all phase states on step change
  useEffect(() => {
    console.log('Step change effect triggered:', { currentStep, showSteps, step2Visible });
    if (currentStep === 1 && showSteps && step2Visible) {
      console.log('Step 2 starting - resetting phase states');
      setStep2Phase(1); // Start with bottom factors
      setShowBottomLeftFactor(false);
      setShowBottomRightFactor(false);
      setShowTopLeftFactor(false);
      setShowTopRightFactor(false);
      setShowLeftNumeratorFill(false);
      setShowRightNumeratorFill(false);
    } else {
      setStep2Phase(0);
      setShowBottomLeftFactor(false);
      setShowBottomRightFactor(false);
      setShowTopLeftFactor(false);
      setShowTopRightFactor(false);
      setShowLeftNumeratorFill(false);
      setShowRightNumeratorFill(false);
    }
  }, [currentStep, showSteps, step2Visible]);

  // Phase 1: bottom factors fade in
  useEffect(() => {
    if (step2Phase === 1) {
      console.log('Step 2 Phase 1: Bottom factors fade in START');
      setShowBottomLeftFactor(true);
      setShowBottomRightFactor(true);
      const next = setTimeout(() => {
        console.log('Step 2 Phase 1: Bottom factors fade in END');
        setStep2Phase(2);
      }, 1200); // match fade-in duration
      return () => clearTimeout(next);
    }
  }, [step2Phase]);

  // Phase 2: denominator animation
  useEffect(() => {
    if (step2Phase === 2) {
      console.log('Step 2 Phase 2: Denominator animation START');
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
          console.log('Step 2 Phase 2: Denominator animation END');
          setStep2Phase(3); // Next phase: top left factor
        }
      };
      setTimeout(animate, 500); // 0.5s delay before denominator animation
    }
  }, [step2Phase]);

  // Phase 3: top left factor fade in
  useEffect(() => {
    if (step2Phase === 3) {
      console.log('Step 2 Phase 3: Top left factor fade in START');
      setShowTopLeftFactor(true);
      const next = setTimeout(() => {
        console.log('Step 2 Phase 3: Top left factor fade in END');
        setStep2Phase(4);
      }, 1200); // match fade-in duration
      return () => clearTimeout(next);
    }
  }, [step2Phase]);

  // Phase 4: left numerator fill
  useEffect(() => {
    if (step2Phase === 4) {
      console.log('Step 2 Phase 4: Left numerator fill START');
      setShowLeftNumeratorFill(true);
      // Animate left numerator fill
      setStep2ShadeNumerator1Float(0);
      const targetNum1 = result.steps.adjustedNumerator1;
      const duration = 1200;
      let start = null;
      function animate(ts) {
        if (!start) start = ts;
        const elapsed = ts - start;
        const progress = Math.min(elapsed / duration, 1);
        setStep2ShadeNumerator1Float(progress * targetNum1);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setStep2ShadeNumerator1Float(targetNum1);
          console.log('Step 2 Phase 4: Left numerator fill END');
          setStep2Phase(5);
        }
      }
      requestAnimationFrame(animate);
    }
  }, [step2Phase, result]);

  // Phase 5: top right factor fade in
  useEffect(() => {
    if (step2Phase === 5) {
      console.log('Step 2 Phase 5: Top right factor fade in START');
      setShowRightNumeratorFill(false); // Ensure hidden before fade-in
      setShowTopRightFactor(true);
      // After fade-in, wait 300ms, then advance to phase 6
      const next = setTimeout(() => {
        console.log('Step 2 Phase 5: Top right factor fade in END');
        setTimeout(() => setStep2Phase(6), 300); // 300ms delay after fade-in
      }, 1200); // match fade-in duration
      return () => clearTimeout(next);
    }
  }, [step2Phase]);

  // Phase 6: right numerator fill
  useEffect(() => {
    if (step2Phase === 6) {
      console.log('Step 2 Phase 6: Right numerator fill START');
      setShowRightNumeratorFill(true);
    }
  }, [step2Phase]);

  // Phase 6: right numerator fill animation
  useEffect(() => {
    console.log('Right fill effect check:', { step2Phase, showRightNumeratorFill, adjustedNumerator2: result?.steps?.adjustedNumerator2 });
    if (step2Phase === 6 && showRightNumeratorFill) {
      console.log('Step 2 Phase 6: Right numerator fill animation START');
      setStep2ShadeNumerator2Float(0);
      const targetNum2 = result.steps.adjustedNumerator2;
      const duration = 1200;
      let start = null;
      function animate(ts) {
        if (!start) start = ts;
        const elapsed = ts - start;
        const progress = Math.min(elapsed / duration, 1);
        setStep2ShadeNumerator2Float(progress * targetNum2);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setStep2ShadeNumerator2Float(targetNum2);
          console.log('Step 2 Phase 6: Right numerator fill animation END');
          setStep2NumeratorAnimationDone(true);
          setHideContinue(false); // Show continue button after animation
        }
      }
      requestAnimationFrame(animate);
    } else if (step2Phase !== 6) {
      setStep2ShadeNumerator2Float(0);
    }
  }, [step2Phase, showRightNumeratorFill, result]);

  // Fade in Step 3 and animate numerators
  useEffect(() => {
    if (currentStep === 2 && showSteps) {
      setStep3AnimatedNumerator1(fractions.fraction1.numerator);
      setStep3AnimatedNumerator2(fractions.fraction2.numerator);
      setHideContinue(false); // Show Continue button immediately
    }
  }, [currentStep, showSteps]);

  // Smoothly animate numerator shading after denominator animation completes
  // DISABLED: This legacy system conflicts with the phased animation system
  // The phased system now handles all step 2 animations properly
  /*
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
      const duration = 1200; // ms for each fill
      const delay = setTimeout(() => {
        // Animate first numerator only
        let start = null;
        function animateFirst(ts) {
          if (!start) start = ts;
          const elapsed = ts - start;
          const progress = Math.min(elapsed / duration, 1);
          setStep2ShadeNumerator1Float(progress * targetNum1);
          if (progress < 1) {
            requestAnimationFrame(animateFirst);
          } else {
            // Don't animate second numerator here - it's handled by the phased system
            setStep2NumeratorAnimationDone(true);
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
  */

  useEffect(() => {
    if (currentStep === 2 && showSteps) {
      setShowSumFraction(false);
      setIsFadingOut(false);
      const fadeOutTimer = setTimeout(() => setIsFadingOut(true), 1200);
      const showSumTimer = setTimeout(() => setShowSumFraction(true), 2000);
      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(showSumTimer);
      };
    }
  }, [currentStep, showSteps]);

  useEffect(() => {
    // Hide Continue button during step transitions or animations
    console.log('Continue button logic:', { 
      isAnimatingDenominator, 
      hideContinue, 
      currentStep, 
      step2NumeratorAnimationDone, 
      showSteps, 
      showLCMText 
    });
    if (
      isAnimatingDenominator ||
      hideContinue ||
      (currentStep === 1 && !step2NumeratorAnimationDone) ||
      (showSteps && currentStep === 0 && !showLCMText)
    ) {
      console.log('Hiding continue button');
      setShowContinueButton(false);
    } else {
      console.log('Showing continue button');
      setShowContinueButton(true);
    }
  }, [isAnimatingDenominator, hideContinue, step2NumeratorAnimationDone, showSteps, currentStep, showLCMText]);

  useEffect(() => {
    if (step2NumeratorAnimationDone) {
      const timeout = setTimeout(() => setFactorsVisible(false), 500);
      return () => clearTimeout(timeout);
    } else {
      setFactorsVisible(true);
    }
  }, [step2NumeratorAnimationDone]);

  const handleInputChange = (fractionKey, part, value) => {
    if (showSteps) return;
    // Convert to number and validate
    let numValue = parseInt(value) || '';
    // Ensure value is between 1 and 10
    if (numValue !== '') {
      numValue = Math.max(1, Math.min(10, numValue));
    }
    // Remove automatic correction of improper fractions - let user see the visual indicator
    setFractions(prev => ({
      ...prev,
      [fractionKey]: {
        ...prev[fractionKey],
        [part]: numValue
      }
    }));
  };

  // Helper function to check if a fraction is proper
  const isProperFraction = (numerator, denominator) => {
    return numerator && denominator && parseInt(numerator) < parseInt(denominator);
  };

  // Helper function to check if a fraction is improper
  const isImproperFraction = (numerator, denominator) => {
    return numerator && denominator && parseInt(numerator) >= parseInt(denominator);
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
    setShowCommonDenominator(false);
    setPieMoveDown(false);
    setShowLCMText(false);
    setShowMultiplicationFactors(false);
    setShowSumFraction(false);
    setIsFadingOut(false);
    setShowContinueButton(true);
    // Reset factor fade-in states for step 2
    setShowBottomLeftFactor(false);
    setShowBottomRightFactor(false);
    setShowTopLeftFactor(false);
    setShowTopRightFactor(false);
    // Reset animation phase states for strict sequencing in step 2
    setStep2Phase(0);
    setShowLeftNumeratorFill(false);
    setShowRightNumeratorFill(false);
    setIsAnimatingDenominator(false);
    if (resetButtonRef.current) {
      resetButtonRef.current.blur();
    }
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
      // Step 3 (index 2) is now the last step before finish
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
              <Fraction numerator={f1.numerator} denominator={f1.denominator} size="1.5em" color="black" lineColor="black" />
              <span className="plus-centered">+</span>
              <Fraction numerator={f2.numerator} denominator={f2.denominator} size="1.5em" color="black" lineColor="black" />
            </div>
            <div style={{ height: '28px', marginTop: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {showLCMText && showCommonDenominator && result && (
                <div style={{ color: '#5750E3', fontWeight: 500, fontSize: '1.05em', textAlign: 'center', animation: 'fadeInScale 0.6s ease-out' }}>
                  Least common multiple of {f1.denominator} and {f2.denominator} is {result.steps.commonDenominator}
                </div>
              )}
            </div>
            <div className={`pie-charts-container${pieMoveDown ? ' pie-move-down' : ''}`} style={{ justifyContent: 'center', marginTop: '-25px', ...pieStepStyle }}>
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
        
        // Calculate the factors
        const factor1 = result.steps.commonDenominator / f1.denominator;
        const factor2 = result.steps.commonDenominator / f2.denominator;

        return (
          <div className={`step-content fade-in-step2${step2Visible ? '' : ' fade-in-step2-hidden'}`} style={{ color: 'black' }}>
            <h3 style={{ color: 'black' }}>Step 2: Rewrite with common denominator and adjust numerators</h3>
            <div className="adjusted-fractions fraction-sum-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'black' }}>
              {/* Left fraction with factors on the left */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', lineHeight: '1.2', minHeight: '2.5em' }}>
                  {/* Top left factor */}
                  <span
                    className={`fade-in-factor${showTopLeftFactor && factorsVisible ? ' visible' : ''}`}
                    style={{
                      color: '#4E48CC',
                      fontWeight: 700,
                      fontSize: '1.5em',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      minWidth: '2.5em',
                      display: 'inline-block',
                    }}
                  >
                    {showTopLeftFactor && (
                      <span className={step2NumeratorAnimationDone ? 'fade-out-factor' : ''}>
                        {factor1} ×
                      </span>
                    )}
                  </span>
                  {/* Bottom left factor */}
                  <span
                    className={`fade-in-factor${showBottomLeftFactor && factorsVisible ? ' visible' : ''}`}
                    style={{
                      color: '#4E48CC',
                      fontWeight: 700,
                      fontSize: '1.5em',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      minWidth: '2.5em',
                      display: 'inline-block',
                    }}
                  >
                    {showBottomLeftFactor && (
                      <span className={step2NumeratorAnimationDone ? 'fade-out-factor' : ''}>
                        {factor1} ×
                      </span>
                    )}
                  </span>
                </span>
                <Fraction numerator={displayNumeratorEq1} denominator={animatedDenominator1 || f1.denominator} size="1.5em" color="black" lineColor="black" />
              </div>
              <span className="plus-centered" style={{ color: 'black' }}>+</span>
              {/* Right fraction and factors in a row, factors aligned with numerator and denominator, mirroring the left */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Fraction numerator={step2Phase === 6 && showRightNumeratorFill && step2ShadeNumerator2Float >= parseInt(fractions.fraction2.numerator) ? Math.floor(step2ShadeNumerator2Float) : displayNumeratorEq2} denominator={animatedDenominator2 || f2.denominator} size="1.5em" color="black" lineColor="black" />
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', lineHeight: '1.2', minHeight: '2.5em' }}>
                  {/* Top right factor */}
                  <span
                    className={`fade-in-factor${showTopRightFactor && factorsVisible ? ' visible' : ''}`}
                    style={{
                      color: '#4E48CC',
                      fontWeight: 700,
                      fontSize: '1.5em',
                      outline: '1px solid blue !important',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      minWidth: '2.5em',
                      display: 'inline-block',
                    }}
                  >
                    {showTopRightFactor && (
                      <span className={step2NumeratorAnimationDone ? 'fade-out-factor' : ''}>
                        × {factor2}
                      </span>
                    )}
                  </span>
                  {/* Bottom right factor */}
                  <span
                    className={`fade-in-factor${showBottomRightFactor && factorsVisible ? ' visible' : ''}`}
                    style={{
                      color: '#4E48CC',
                      fontWeight: 700,
                      fontSize: '1.5em',
                      outline: '1px solid blue !important',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      minWidth: '2.5em',
                      display: 'inline-block',
                    }}
                  >
                    {showBottomRightFactor && (
                      <span className={step2NumeratorAnimationDone ? 'fade-out-factor' : ''}>
                        × {factor2}
                      </span>
                    )}
                  </span>
                </span>
              </div>
            </div>
            <div className={`pie-charts-container${pieMoveDown ? ' pie-move-down' : ''}`} style={{ justifyContent: 'center', marginTop: '-25px', ...pieStepStyle }}>
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
                    step2Phase === 6 && showRightNumeratorFill ? step2ShadeNumerator2Float : 0,
                    animatedDenominator2 || result.steps.commonDenominator,
                    null,
                    step2Phase === 6 && showRightNumeratorFill
                  )}
                </div>
              </div>
            </div>
            {/* Fade-in Continue button after last animation in step 2 */}
            {currentStep === 1 && step2NumeratorAnimationDone && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <button
                  className="glow-button simple-glow fade-in-continue"
                  onClick={handleNextStep}
                  style={{ minWidth: 120, fontSize: '1.1em' }}
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        );
      case 2:
        // Step 3: Add the numerators
        const sumNumerator = result.steps.sumNumerator;
        const sumDenominator = result.steps.commonDenominator;
        const whole = Math.floor(sumNumerator / sumDenominator);
        const remainder = sumNumerator % sumDenominator;
        return (
          <div className="step-content">
            <h3>Step 3: Add the numerators</h3>
            <div style={{ minHeight: 200, position: 'relative', width: '100%' }}>
              {/* Group 1: Two fractions and pies, fade out */}
              <div className={showSumFraction ? 'fade-out-fraction' : 'fade-in-fraction'} style={{
                pointerEvents: showSumFraction ? 'none' : 'auto',
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                margin: 'auto',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div className="sum-fractions-fade fade-in" style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center', marginBottom: 16 }}>
                  <Fraction numerator={result.steps.adjustedNumerator1} denominator={result.steps.commonDenominator} size="1.5em" color="black" lineColor="black" />
                  <span className="plus-centered">+</span>
                  <Fraction numerator={result.steps.adjustedNumerator2} denominator={result.steps.commonDenominator} size="1.5em" color="black" lineColor="black" />
                </div>
                <div className={`pie-charts-container${pieMoveDown ? ' pie-move-down' : ''}`} style={{ justifyContent: 'center', marginTop: '12px', display: 'flex', gap: '12px' }}>
                  <div className="pie-charts-flex sum-fractions-fade fade-in" style={{ gap: '16px' }}>
                    <div className="pie-chart">
                      {renderPieChart(result.steps.adjustedNumerator1, result.steps.commonDenominator)}
                    </div>
                    <div className="pie-chart">
                      {renderPieChart(result.steps.adjustedNumerator2, result.steps.commonDenominator)}
                    </div>
                  </div>
                </div>
              </div>
              {/* Group 2: Sum and its pies, fade in */}
              <div className={showSumFraction ? 'fade-in-fraction' : 'fade-out-fraction'} style={{
                pointerEvents: showSumFraction ? 'auto' : 'none',
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                margin: 'auto',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div className="sum-fraction sum-fractions-fade fade-in" style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Fraction numerator={sumNumerator} denominator={sumDenominator} size="1.5em" color="black" lineColor="black" />
                </div>
                <div className={`pie-charts-container${pieMoveDown ? ' pie-move-down' : ''}`} style={{ justifyContent: 'center', marginTop: '24px', display: 'flex', gap: '12px' }}>
                  <div className="pie-charts-flex">
                    {whole > 0 &&
                      Array.from({ length: whole }).map((_, i) => (
                        <div className="pie-chart" key={`whole-pie-${i}`}>
                          {renderPieChart(sumDenominator, sumDenominator)}
                        </div>
                      ))}
                    {remainder > 0 && (
                      <div className="pie-chart" key="remainder-pie">
                        {renderPieChart(remainder, sumDenominator)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
            <div className={`pie-charts-container${pieMoveDown ? ' pie-move-down' : ''}`} style={{ justifyContent: 'center', marginTop: '-25px', ...pieStepStyle }}>
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
  const renderImproperPieCharts = (numerator, denominator, hideImproper = false) => {
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
    
    // If hideImproper is true, don't show pie charts for improper fractions
    if (hideImproper) {
      return (
        <div className="pie-charts-flex">
          <div className="pie-chart" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#E23B3B',
            fontSize: '0.9em',
            fontWeight: 500,
            border: '2px dashed #E23B3B',
            borderRadius: '50%',
            width: '150px',
            height: '150px',
            opacity: 0.7
          }}>
            No pie chart for improper fractions
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

  useEffect(() => {
    if (currentStep !== 0) {
      setPieMoveDown(false);
      setShowLCMText(false);
    }
  }, [currentStep]);

  return (
    <div className="fraction-addition-root" style={{
      maxWidth: 500,
      margin: '32px auto 0 auto',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      padding: 0,
      position: 'relative',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 500,
    }}>
      {/* Header row with title and reset button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 0 20px' }}>
        <h2 style={{ color: '#5750E3', fontSize: '1.1em', fontWeight: 700, margin: 0, letterSpacing: 0.2 }}>Fraction Addition</h2>
        <button className="custom-reset-button" onClick={resetAll} ref={resetButtonRef}>Reset</button>
      </div>
      {/* Inner box for interactive content */}
      <div style={{
        background: '#E8EDF5',
        borderRadius: 12,
        margin: '16px',
        padding: '18px 12px 12px 12px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}>
        <div className="content-inner">
          {!showSteps ? (
            <>
              <p className="instructions">Enter two proper fractions (numerator less than denominator) to see how to add them step by step</p>
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
                        className={isImproperFraction(fractions.fraction1.numerator, fractions.fraction1.denominator) ? 'input-error' : ''}
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
                        className={isImproperFraction(fractions.fraction1.numerator, fractions.fraction1.denominator) ? 'input-error' : ''}
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
                        className={isImproperFraction(fractions.fraction2.numerator, fractions.fraction2.denominator) ? 'input-error' : ''}
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
                        className={isImproperFraction(fractions.fraction2.numerator, fractions.fraction2.denominator) ? 'input-error' : ''}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="fraction-pie-row">
                {isProperFraction(fractions.fraction1.numerator, fractions.fraction1.denominator) && isProperFraction(fractions.fraction2.numerator, fractions.fraction2.denominator) && (
                  <>
                    <div className="fraction-cell">
                      <Fraction numerator={fractions.fraction1.numerator} denominator={fractions.fraction1.denominator} color="black" lineColor="black" />
                    </div>
                    <div className="pie-chart">
                      {renderPieChart(fractions.fraction1.numerator, fractions.fraction1.denominator)}
                    </div>
                    <div className="pie-chart">
                      {renderPieChart(fractions.fraction2.numerator, fractions.fraction2.denominator)}
                    </div>
                    <div className="fraction-cell">
                      <Fraction numerator={fractions.fraction2.numerator} denominator={fractions.fraction2.denominator} color="black" lineColor="black" />
                    </div>
                  </>
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
                  <div className={`pie-charts-container${pieMoveDown ? ' pie-move-down' : ''}`} style={{ justifyContent: 'center' }}>
                    {renderImproperPieCharts(result.numerator, result.denominator)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="button-bar">
          <div style={{ flex: 1 }} />
          <button
            className={`glow-button simple-glow button-bar-right fade-in-out${!(
              fractions.fraction1.numerator &&
              fractions.fraction1.denominator &&
              fractions.fraction2.numerator &&
              fractions.fraction2.denominator &&
              parseInt(fractions.fraction1.denominator) > 1 &&
              parseInt(fractions.fraction2.denominator) > 1 &&
              isProperFraction(fractions.fraction1.numerator, fractions.fraction1.denominator) &&
              isProperFraction(fractions.fraction2.numerator, fractions.fraction2.denominator) &&
              (!showSteps || (showSteps && !isComplete)) &&
              !isAnimatingDenominator &&
              !hideContinue &&
              (currentStep !== 1 || step2NumeratorAnimationDone) &&
              (!showSteps || currentStep !== 0 || showLCMText) &&
              (currentStep !== 2 || showSumFraction)
            ) ? ' hide' : ''}`}
            style={{ pointerEvents: !(
              fractions.fraction1.numerator &&
              fractions.fraction1.denominator &&
              fractions.fraction2.numerator &&
              fractions.fraction2.denominator &&
              parseInt(fractions.fraction1.denominator) > 1 &&
              parseInt(fractions.fraction2.denominator) > 1 &&
              isProperFraction(fractions.fraction1.numerator, fractions.fraction1.denominator) &&
              isProperFraction(fractions.fraction2.numerator, fractions.fraction2.denominator) &&
              (!showSteps || (showSteps && !isComplete)) &&
              !isAnimatingDenominator &&
              !hideContinue &&
              (currentStep !== 1 || step2NumeratorAnimationDone) &&
              (!showSteps || currentStep !== 0 || showLCMText) &&
              (currentStep !== 2 || showSumFraction)
            ) ? 'none' : 'auto' }}
            onClick={!showSteps ? startSteps : handleNextStep}
          >
            {showSteps && !isComplete && currentStep >= 3 ? 'Finish' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FractionAddition;