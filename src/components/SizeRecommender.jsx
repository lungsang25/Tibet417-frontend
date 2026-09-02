import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import Modal from './Modal';

const SizeRecommender = ({ isOpen, onClose, productData, onSizeSelect }) => {
  const { t } = useTranslation('sizeRecommender');
  const { backendUrl, token } = useContext(ShopContext);
  
  const [step, setStep] = useState(1); // 1: input, 2: guide, 3: result
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    chest: '',
    waist: '',
    hips: '',
    inseam: ''
  });
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Load saved measurements when modal opens
  useEffect(() => {
    if (isOpen && token) {
      loadSavedMeasurements();
    }
  }, [isOpen, token]);

  const loadSavedMeasurements = async () => {
    try {
      const response = await axios.post(
        backendUrl + '/api/user/measurements',
        {},
        { headers: { token } }
      );
      
      if (response.data.success && response.data.measurements) {
        const saved = response.data.measurements;
        setMeasurements({
          height: saved.height || '',
          weight: saved.weight || '',
          chest: saved.chest || '',
          waist: saved.waist || '',
          hips: saved.hips || '',
          inseam: saved.inseam || ''
        });
      }
    } catch (error) {
      console.log('Error loading measurements:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateMeasurements = () => {
    const required = ['height', 'chest', 'waist'];
    for (const field of required) {
      if (!measurements[field] || parseFloat(measurements[field]) <= 0) {
        toast.error(t(`validation.${field}Required`));
        return false;
      }
    }
    return true;
  };

  const calculateRecommendation = () => {
    if (!validateMeasurements()) return;

    setLoading(true);

    // Get size chart for product (use default if not available)
    const sizeChart = productData.sizeChart || getDefaultSizeChart(productData.category);
    
    // Calculate recommendation
    const result = calculateSizeMatch(measurements, sizeChart);
    
    setRecommendation(result);
    setStep(3);
    setLoading(false);

    // Save measurements if user is logged in
    if (token) {
      saveMeasurements();
    }
  };

  const saveMeasurements = async () => {
    try {
      await axios.post(
        backendUrl + '/api/user/measurements/update',
        { measurements },
        { headers: { token } }
      );
    } catch (error) {
      console.log('Error saving measurements:', error);
    }
  };

  const calculateSizeMatch = (userMeasurements, sizeChart) => {
    const scores = {};
    const availableSizes = Object.keys(sizeChart);

    const weights = {
      chest: 0.35,
      waist: 0.30,
      hips: 0.25,
      height: 0.10
    };

    for (const size of availableSizes) {
      const sizeData = sizeChart[size];
      let totalScore = 0;
      let totalWeight = 0;

      for (const [measurement, weight] of Object.entries(weights)) {
        if (userMeasurements[measurement] && sizeData[measurement]) {
          const userValue = parseFloat(userMeasurements[measurement]);
          const { min, max } = sizeData[measurement];

          if (userValue >= min && userValue <= max) {
            const midpoint = (min + max) / 2;
            const range = max - min;
            const deviation = Math.abs(userValue - midpoint) / range;
            const score = 1 - (deviation * 0.3);
            totalScore += score * weight;
          } else if (userValue < min) {
            const difference = min - userValue;
            const penalty = Math.min(difference / min, 1);
            totalScore += (1 - penalty) * weight * 0.5;
          } else {
            const difference = userValue - max;
            const penalty = Math.min(difference / max, 1);
            totalScore += (1 - penalty) * weight * 0.5;
          }
          totalWeight += weight;
        }
      }

      scores[size] = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
    }

    const sortedSizes = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([size, score]) => ({ size, confidence: Math.round(score) }));

    if (sortedSizes.length === 0) {
      return { recommendedSize: null, confidence: 0, alternatives: [] };
    }

    const recommended = sortedSizes[0];
    const alternatives = sortedSizes.slice(1, 3).filter(s => s.confidence > 50);

    return {
      recommendedSize: recommended.size,
      confidence: recommended.confidence,
      alternatives: alternatives.map(a => a.size),
      fitDescription: getFitDescription(recommended.confidence)
    };
  };

  const getFitDescription = (confidence) => {
    if (confidence >= 85) return 'perfect';
    if (confidence >= 70) return 'great';
    if (confidence >= 55) return 'good';
    return 'approximate';
  };

  const getDefaultSizeChart = (category) => {
    const charts = {
      Men: {
        S: { chest: { min: 86, max: 91 }, waist: { min: 71, max: 76 }, hips: { min: 91, max: 96 }, height: { min: 165, max: 175 } },
        M: { chest: { min: 91, max: 96 }, waist: { min: 76, max: 81 }, hips: { min: 96, max: 101 }, height: { min: 170, max: 180 } },
        L: { chest: { min: 96, max: 101 }, waist: { min: 81, max: 86 }, hips: { min: 101, max: 106 }, height: { min: 175, max: 185 } },
        XL: { chest: { min: 101, max: 106 }, waist: { min: 86, max: 91 }, hips: { min: 106, max: 111 }, height: { min: 180, max: 190 } },
        XXL: { chest: { min: 106, max: 112 }, waist: { min: 91, max: 97 }, hips: { min: 111, max: 117 }, height: { min: 180, max: 195 } }
      },
      Women: {
        XS: { chest: { min: 78, max: 82 }, waist: { min: 60, max: 64 }, hips: { min: 86, max: 90 }, height: { min: 155, max: 165 } },
        S: { chest: { min: 82, max: 86 }, waist: { min: 64, max: 68 }, hips: { min: 90, max: 94 }, height: { min: 160, max: 170 } },
        M: { chest: { min: 86, max: 90 }, waist: { min: 68, max: 72 }, hips: { min: 94, max: 98 }, height: { min: 165, max: 175 } },
        L: { chest: { min: 90, max: 96 }, waist: { min: 72, max: 78 }, hips: { min: 98, max: 104 }, height: { min: 165, max: 175 } },
        XL: { chest: { min: 96, max: 102 }, waist: { min: 78, max: 84 }, hips: { min: 104, max: 110 }, height: { min: 165, max: 180 } }
      },
      Kids: {
        '4-5Y': { chest: { min: 56, max: 58 }, waist: { min: 52, max: 54 }, hips: { min: 58, max: 61 }, height: { min: 104, max: 110 } },
        '6-7Y': { chest: { min: 58, max: 61 }, waist: { min: 54, max: 56 }, hips: { min: 61, max: 64 }, height: { min: 116, max: 122 } },
        '8-9Y': { chest: { min: 61, max: 66 }, waist: { min: 56, max: 58 }, hips: { min: 64, max: 69 }, height: { min: 128, max: 134 } },
        '10-11Y': { chest: { min: 66, max: 71 }, waist: { min: 58, max: 61 }, hips: { min: 69, max: 74 }, height: { min: 140, max: 146 } },
        '12-13Y': { chest: { min: 71, max: 78 }, waist: { min: 61, max: 66 }, hips: { min: 74, max: 81 }, height: { min: 152, max: 158 } }
      }
    };
    return charts[category] || charts.Men;
  };

  const handleSelectSize = (size) => {
    onSizeSelect(size);
    onClose();
    toast.success(t('sizeSelected', { size }));
  };

  const resetAndClose = () => {
    setStep(1);
    setRecommendation(null);
    setShowGuide(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} titleId="size-recommender-title" className="max-w-2xl">
      <div className="p-6">
        <h2 id="size-recommender-title" className="text-2xl font-medium mb-4">
          {t('title')}
        </h2>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-stone text-sm mb-6">{t('description')}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('fields.height')} (cm) *
                </label>
                <input
                  type="number"
                  value={measurements.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="w-full px-3 py-2 border border-line focus:outline-none focus:border-ink"
                  placeholder="170"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('fields.weight')} (kg)
                </label>
                <input
                  type="number"
                  value={measurements.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="w-full px-3 py-2 border border-line focus:outline-none focus:border-ink"
                  placeholder="70"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('fields.chest')} (cm) *
                </label>
                <input
                  type="number"
                  value={measurements.chest}
                  onChange={(e) => handleInputChange('chest', e.target.value)}
                  className="w-full px-3 py-2 border border-line focus:outline-none focus:border-ink"
                  placeholder="90"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('fields.waist')} (cm) *
                </label>
                <input
                  type="number"
                  value={measurements.waist}
                  onChange={(e) => handleInputChange('waist', e.target.value)}
                  className="w-full px-3 py-2 border border-line focus:outline-none focus:border-ink"
                  placeholder="75"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('fields.hips')} (cm)
                </label>
                <input
                  type="number"
                  value={measurements.hips}
                  onChange={(e) => handleInputChange('hips', e.target.value)}
                  className="w-full px-3 py-2 border border-line focus:outline-none focus:border-ink"
                  placeholder="95"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('fields.inseam')} (cm)
                </label>
                <input
                  type="number"
                  value={measurements.inseam}
                  onChange={(e) => handleInputChange('inseam', e.target.value)}
                  className="w-full px-3 py-2 border border-line focus:outline-none focus:border-ink"
                  placeholder="80"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <p className="text-xs text-stone mt-4">{t('requiredNote')}</p>

            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-sm text-ink underline mt-2"
            >
              {showGuide ? t('hideGuide') : t('showGuide')}
            </button>

            {showGuide && (
              <div className="mt-4 p-4 bg-line/30 rounded text-sm space-y-2">
                <p className="font-medium">{t('guide.title')}</p>
                <ul className="list-disc list-inside space-y-1 text-stone">
                  <li>{t('guide.height')}</li>
                  <li>{t('guide.chest')}</li>
                  <li>{t('guide.waist')}</li>
                  <li>{t('guide.hips')}</li>
                  <li>{t('guide.inseam')}</li>
                </ul>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={calculateRecommendation}
                disabled={loading}
                className="flex-1 bg-ink text-paper px-6 py-3 text-sm disabled:opacity-50"
              >
                {loading ? t('calculating') : t('findMySize')}
              </button>
              <button
                onClick={resetAndClose}
                className="px-6 py-3 text-sm border border-line"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        )}

        {step === 3 && recommendation && (
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="inline-block p-4 bg-ink/5 rounded-full mb-4">
                <span className="text-4xl font-bold text-ink">
                  {recommendation.recommendedSize}
                </span>
              </div>
              <h3 className="text-xl font-medium mb-2">
                {t('result.title')}
              </h3>
              <p className="text-stone">
                {t(`result.fit.${recommendation.fitDescription}`)}
              </p>
              <div className="mt-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-stone">{t('result.confidence')}:</span>
                  <span className="font-medium">{recommendation.confidence}%</span>
                </div>
                <div className="w-full bg-line h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-ink h-full transition-all"
                    style={{ width: `${recommendation.confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {recommendation.alternatives && recommendation.alternatives.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">{t('result.alternatives')}:</p>
                <div className="flex gap-2">
                  {recommendation.alternatives.map((size) => (
                    <span
                      key={size}
                      className="px-3 py-1 border border-line text-sm"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => handleSelectSize(recommendation.recommendedSize)}
                className="flex-1 bg-ink text-paper px-6 py-3 text-sm"
              >
                {t('result.selectSize')}
              </button>
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 text-sm border border-line"
              >
                {t('result.tryAgain')}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SizeRecommender;
