import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    { key: 'heart_rate', label: 'Какая частота сердечных сокращений? (уд/мин)', type: 'number', min: 0, max: 1 },
    { key: 'diabetes', label: 'У вас есть сахарный диабет?', type: 'boolean' },
    { key: 'family_history', label: 'Были ли у родственников проблемы с сердцем?', type: 'boolean' },
    { key: 'obesity', label: 'Страдаете ли вы ожирением?', type: 'boolean' },
    { key: 'alcohol_consumption', label: 'Вы употребляете алкоголь?', type: 'boolean' },
    { key: 'exercise_hours_per_week', label: 'Сколько у вас часов физической нагрузки в неделю?', type: 'number', min: 0, max: 1 },
    { key: 'previous_heart_problems', label: 'Были ли у вас проблемы с сердцем ранее?', type: 'boolean' },
    { key: 'medication_use', label: 'Вы принимаете лекарства?', type: 'boolean' },
    { key: 'stress_level', label: 'Оцените свой уровень стресса от 1 до 10', type: 'slider', min: 1, max: 10 },
    { key: 'sedentary_hours_per_day', label: 'Сколько часов в день вы проводите сидя?', type: 'number', min: 0, max: 1 },
    { key: 'income', label: 'Ваш доход в месяц (руб.)', type: 'number', min: 0, max: 1 },
    { key: 'bmi', label: 'Ваш ИМТ (Индекс массы тела)', type: 'number', min: 0, max: 1 },
    { key: 'triglycerides', label: 'Ваш уровень триглицеридов', type: 'number', min: 0, max: 1 },
    { key: 'physical_activity_days_per_week', label: 'Количество дней с физической нагрузкой в неделю', type: 'slider', min: 0, max: 7 },
    { key: 'sleep_hours_per_day', label: 'Количество часов сна в день', type: 'slider', min: 0, max: 6 },
    { key: 'gender', label: 'Ваш пол', type: 'gender' },
    { key: 'systolic_blood_pressure', label: 'Ваше систолическое давление', type: 'number', min: 0, max: 1 },
    { key: 'diastolic_blood_pressure', label: 'Ваше диастолическое давление', type: 'number', min: 0, max: 1 }
  ];

  const handleChange = (value) => {
    setError('');
    setFormData(prev => ({
      ...prev,
      [steps[currentStep].key]: value
    }));
  };

  const validateNumber = (value, min, max) => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    return num >= min && num <= max;
  };

  const formatNumberInput = (value) => {
    if (value === '') return '';
    const formatted = value.replace(',', '.');
    if (/^\d*\.?\d*$/.test(formatted)) {
      return formatted;
    }
    return value;
  };

  const handleNumberChange = (e) => {
    const value = e.target.value;
    const formattedValue = formatNumberInput(value);
    handleChange(formattedValue);
  };

  const nextStep = () => {
    const current = steps[currentStep];
    const value = formData[current.key];
    
    setError('');
    
    if (value === undefined || value === '') {
      setError('Пожалуйста, введите значение');
      return;
    }
    
    if (current.type === 'number') {
      if (!validateNumber(value, current.min, current.max)) {
        setError(`Значение должно быть от ${current.min} до ${current.max}`);
        return;
      }
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setError('');
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch("http://localhost:8020/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Ошибка сервера");
      }

      const result = await response.json();
      setPrediction({
        risk: result.prediction === 1,
        confidence: result.probability.toFixed(3),
      });
    } catch (err) {
      setError("Не удалось подключиться к серверу. Убедитесь, что FastAPI запущен.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setFormData({});
    setPrediction(null);
    setError('');
  };

  const currentData = formData[steps[currentStep].key];
  const isCurrentFieldFilled = currentData !== undefined && currentData !== '';

  return (
    <div className="app-container">
      <div className="form-wrapper">
        <div className="header">
          <h1 className="title">Оценка риска сердечного приступа</h1>
          <p className="subtitle">Введите данные пошагово для оценки риска</p>
        </div>

        {!prediction ? (
          <div className="card">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>

            <div className="step-header">
              <h2 className="step-title">{steps[currentStep].label}</h2>
              <p className="step-subtitle">Шаг {currentStep + 1} из {steps.length}</p>
            </div>

            {error && <div className="error-box">{error}</div>}

            <div className="input-section">
              {steps[currentStep].type === 'number' && (
                <div className="number-input">
                  <input
                    type="text"
                    value={currentData || ''}
                    onChange={handleNumberChange}
                    className={`input-field ${error ? 'error' : ''}`}
                    placeholder="0.0"
                    autoFocus
                  />
                  <p className="input-help">
                    Введите значение от {steps[currentStep].min} до {steps[currentStep].max}
                  </p>
                </div>
              )}

              {steps[currentStep].type === 'slider' && (
                <div className="slider-input">
                  <input
                    type="range"
                    min={steps[currentStep].min}
                    max={steps[currentStep].max}
                    value={currentData !== undefined ? currentData : steps[currentStep].min}
                    onChange={(e) => handleChange(e.target.value)}
                    className="slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                        (currentData !== undefined ? (currentData - steps[currentStep].min) / (steps[currentStep].max - steps[currentStep].min) * 100 : 0)
                      }%, #e2e8f0 ${
                        (currentData !== undefined ? (currentData - steps[currentStep].min) / (steps[currentStep].max - steps[currentStep].min) * 100 : 0)
                      }%, #e2e8f0 100%)`
                    }}
                  />
                  <div className="slider-labels">
                    <span>{steps[currentStep].min}</span>
                    <span>{steps[currentStep].max}</span>
                  </div>
                  <div className="slider-value">
                    {currentData !== undefined ? currentData : steps[currentStep].min}
                  </div>
                  <p className="input-help">
                    {steps[currentStep].key === 'stress_level' && 'Уровень стресса'}
                    {steps[currentStep].key === 'physical_activity_days_per_week' && 'Дней в неделю'}
                    {steps[currentStep].key === 'sleep_hours_per_day' && 'Часов сна'}
                  </p>
                </div>
              )}

              {steps[currentStep].type === 'boolean' && (
                <div className="boolean-input">
                  <p className="input-help">Выберите один из вариантов:</p>
                  <div className="button-grid">
                    <button
                      onClick={() => handleChange('1')}
                      className={`option-btn ${currentData === '1' ? 'selected' : ''}`}
                    >
                      Да
                    </button>
                    <button
                      onClick={() => handleChange('0')}
                      className={`option-btn ${currentData === '0' ? 'selected' : ''}`}
                    >
                      Нет
                    </button>
                  </div>
                </div>
              )}

              {steps[currentStep].type === 'gender' && (
                <div className="boolean-input">
                  <p className="input-help">Выберите один из вариантов:</p>
                  <div className="button-grid">
                    <button
                      onClick={() => handleChange('1')}
                      className={`option-btn ${currentData === '1' ? 'selected' : ''}`}
                    >
                      Мужчина
                    </button>
                    <button
                      onClick={() => handleChange('0')}
                      className={`option-btn ${currentData === '0' ? 'selected' : ''}`}
                    >
                      Женщина
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="button-group">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="button button-back"
              >
                Назад
              </button>
              <button
                onClick={nextStep}
                className="button button-next"
              >
                {currentStep === steps.length - 1 ? 'Получить прогноз' : 'Далее'}
              </button>
            </div>

            <div className="step-dots">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`dot ${index === currentStep ? 'active' : index < currentStep ? 'done' : ''}`}
                ></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card result-card">
            <div className={`result-icon ${prediction.risk ? 'risk' : 'safe'}`}>
              {prediction.risk ? '⚠️' : '✅'}
            </div>
            <h3 className={`result-title ${prediction.risk ? 'risk' : 'safe'}`}>
              {prediction.risk ? 'Высокий риск' : 'Низкий риск'}
            </h3>
            <p className={`result-text ${prediction.risk ? 'risk' : 'safe'}`}>
              {prediction.risk 
                ? 'Обнаружен высокий риск сердечно-сосудистых заболеваний' 
                : 'Риск сердечно-сосудистых заболеваний находится в пределах нормы'}
            </p>
            <p className="result-confidence">
              Вероятность сердечного приступа: <strong>{prediction.confidence}</strong>
            </p>
            <div className="button-group">
              <button
                onClick={resetForm}
                className="button button-primary wide-button"
              >
                Начать заново
              </button>
              <button
                onClick={() => {
                  setPrediction(null);
                  setError('');
                }}
                className="button button-secondary wide-button"
              >
                Изменить данные
              </button>
            </div>
          </div>
        )}

        <div className="footer">
          <p>Прогноз основан на машинном обучении и не заменяет консультацию врача</p>
        </div>
      </div>
    </div>
  );
};

export default App;