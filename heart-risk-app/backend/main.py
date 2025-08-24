# Импорт библиотек
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import catboost as cb 
import numpy as np 
import os 
from fastapi.middleware.cors import CORSMiddleware

# Инициализация приложения
app = FastAPI(title='Heart Risk Predictor API', version='1.0')

# Путь к модели
MODEL_PATH = 'catboost.cbm'

# Проверка существования модели
if not os.path.exists(MODEL_PATH):
    raise Exception(f'Model not found at {MODEL_PATH}')

# Загрузка модели
try:
    model = cb.CatBoostClassifier()
    model.load_model(MODEL_PATH)
    print('Model loaded succesfully')
except Exception as e:
    raise Exception(f'Failed to load model: {e}')

# Определение входных данных (Pydantic модель)
class InputData(BaseModel):
    heart_rate: float
    diabetes: int
    family_history: int
    obesity: int
    alcohol_consumption: int
    exercise_hours_per_week: float
    previous_heart_problems: int
    medication_use: int
    stress_level: int
    sedentary_hours_per_day: float
    income: float
    bmi: float
    triglycerides: float
    physical_activity_days_per_week: int
    sleep_hours_per_day: int
    gender: int
    systolic_blood_pressure: float
    diastolic_blood_pressure: float

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Эндпоинт для предсказания
@app.post('/predict')
def predict(data: InputData):
    try:
        # Преобразование данных в список в правильном порядке
        input_data = [
            data.heart_rate,
            data.diabetes,
            data.family_history,
            data.obesity,
            data.alcohol_consumption,
            data.exercise_hours_per_week,
            data.previous_heart_problems,
            data.medication_use,
            data.stress_level,
            data.sedentary_hours_per_day,
            data.income,
            data.bmi,
            data.triglycerides,
            data.physical_activity_days_per_week,
            data.sleep_hours_per_day,
            data.gender,
            data.systolic_blood_pressure,
            data.diastolic_blood_pressure,
        ]

        # Преобразование в numpy array
        input_array = np.array([input_data])

        # Предсказание вероятности
        probability = model.predict_proba(input_array)[0, 1]
        pred = 1 if probability >= 0.365 else 0

        return {
            'prediction': int(pred), 
            'probability':float(probability)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Prediction error: {str(e)}')