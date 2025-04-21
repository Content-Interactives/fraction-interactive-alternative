import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import './FractionAddition.css';

const COLORS = ['#0088FE', '#00C49F'];

function FractionAddition() {
  const [fraction1, setFraction1] = useState({ numerator: 1, denominator: 2 });
  const [fraction2, setFraction2] = useState({ numerator: 1, denominator: 3 });
  const [showResult, setShowResult] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [fractionsLocked, setFractionsLocked] = useState(false);

  const handleInputChange = (fraction, field, value) => {
    if (fractionsLocked) return;
    
    const numValue = parseInt(value) || 0;
    if (fraction === 1) {
      setFraction1(prev => ({ ...prev, [field]: numValue }));
    } else {
      setFraction2(prev => ({ ...prev, [field]: numValue }));
    }
  };

  const handleDrop = (e, fractionNum) => {
    e.preventDefault();
    if (fractionNum === 1) {
      setFractionsLocked(true);
    }
  };

  useEffect(() => {
    if (showResult) {
      const timer = setTimeout(() => {
        setAnimationStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showResult, animationStep]);

  const calculateSum = () => {
    const lcm = (a, b) => {
      return (a * b) / gcd(a, b);
    };

    const gcd = (a, b) => {
      return b === 0 ? a : gcd(b, a % b);
    };

    const commonDenominator = lcm(fraction1.denominator, fraction2.denominator);
    const newNumerator1 = fraction1.numerator * (commonDenominator / fraction1.denominator);
    const newNumerator2 = fraction2.numerator * (commonDenominator / fraction2.denominator);
    const sumNumerator = newNumerator1 + newNumerator2;

    const commonDivisor = gcd(sumNumerator, commonDenominator);
    return {
      numerator: sumNumerator / commonDivisor,
      denominator: commonDenominator / commonDivisor
    };
  };

  const sum = calculateSum();

  const pieData1 = [
    { name: 'Filled', value: fraction1.numerator },
    { name: 'Empty', value: fraction1.denominator - fraction1.numerator }
  ];

  const pieData2 = [
    { name: 'Filled', value: fraction2.numerator },
    { name: 'Empty', value: fraction2.denominator - fraction2.numerator }
  ];

  return (
    <div className="fraction-container">
      <h1>Fraction Addition</h1>
      
      <div className="input-section">
        <div className="fraction-input">
          <div className="input-group">
            <input
              type="number"
              value={fraction1.numerator}
              onChange={(e) => handleInputChange(1, 'numerator', e.target.value)}
              disabled={fractionsLocked}
            />
            <hr />
            <input
              type="number"
              value={fraction1.denominator}
              onChange={(e) => handleInputChange(1, 'denominator', e.target.value)}
              disabled={fractionsLocked}
            />
          </div>
          <div className="pie-chart">
            <PieChart width={100} height={100}>
              <Pie
                data={pieData1}
                cx={50}
                cy={50}
                innerRadius={30}
                outerRadius={50}
                startAngle={90}
                endAngle={-270}
                paddingAngle={0}
                dataKey="value"
              >
                {pieData1.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>
        </div>

        <div className="fraction-input">
          <div className="input-group">
            <input
              type="number"
              value={fraction2.numerator}
              onChange={(e) => handleInputChange(2, 'numerator', e.target.value)}
              disabled={fractionsLocked}
            />
            <hr />
            <input
              type="number"
              value={fraction2.denominator}
              onChange={(e) => handleInputChange(2, 'denominator', e.target.value)}
              disabled={fractionsLocked}
            />
          </div>
          <div className="pie-chart">
            <PieChart width={100} height={100}>
              <Pie
                data={pieData2}
                cx={50}
                cy={50}
                innerRadius={30}
                outerRadius={50}
                startAngle={90}
                endAngle={-270}
                paddingAngle={0}
                dataKey="value"
              >
                {pieData2.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>
        </div>
      </div>

      <div 
        className="drop-zone"
        onDrop={(e) => handleDrop(e, 1)}
        onDragOver={(e) => e.preventDefault()}
      >
        {fractionsLocked && (
          <button 
            className="add-button"
            onClick={() => setShowResult(true)}
          >
            Add Fractions
          </button>
        )}
      </div>

      {showResult && (
        <div className="result-section">
          {animationStep >= 1 && (
            <div className="step">
              <h3>Step 1: Find Common Denominator</h3>
              <p>LCM of {fraction1.denominator} and {fraction2.denominator} = {sum.denominator}</p>
            </div>
          )}
          
          {animationStep >= 2 && (
            <div className="step">
              <h3>Step 2: Convert Fractions</h3>
              <p>
                {fraction1.numerator}/{fraction1.denominator} = 
                {(fraction1.numerator * (sum.denominator / fraction1.denominator))}/{sum.denominator}
              </p>
              <p>
                {fraction2.numerator}/{fraction2.denominator} = 
                {(fraction2.numerator * (sum.denominator / fraction2.denominator))}/{sum.denominator}
              </p>
            </div>
          )}
          
          {animationStep >= 3 && (
            <div className="step">
              <h3>Step 3: Add Numerators</h3>
              <p>
                {(fraction1.numerator * (sum.denominator / fraction1.denominator))} + 
                {(fraction2.numerator * (sum.denominator / fraction2.denominator))} = 
                {sum.numerator}
              </p>
            </div>
          )}
          
          {animationStep >= 4 && (
            <div className="step">
              <h3>Final Result</h3>
              <p>{sum.numerator}/{sum.denominator}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FractionAddition; 