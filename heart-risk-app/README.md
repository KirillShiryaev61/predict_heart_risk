# Оценка риска сердечного приступа

Это веб-приложение на основе модели машинного обучения *(CatBoost)*, которое оценивает риск сердечного приступа на основе анкетных данных.

- **Бэкенд**: FastAPI *(Python)*
- **Фронтенд**: React *(JavaScript)*
- **Модель**: CatBoost *(`catboost.cbm`)*
- **Порог срабатывания**: 0.365 *(оптимизирован для баланса precision/recall)*

---

> ***Примечание: Проект выполнен в рамках обучения. Прогноз не заменяет консультацию врача.***

---

## Как запустить проект: 

### Клонируй репозиторий (если используется Git)

```bash
git clone https://github.com/KirillShiryaev61/predict_heart_risk.git
cd heart-risk-app
```

---

## Запуск бэкенда (FastAPI):

### Требования:
- Python 3.8+
- pip

### Установка зависимостей:

```bash
cd backend
python -m venv venv
```

> Активация виртуального окружения:
> - **macOS/Linux**: `source venv/bin/activate`
> - **Windows**: `venv\Scripts\activate`


```
pip install -r requirements.txt
```

### Запуск сервера:

```bash
uvicorn main:app --reload --port=8020
```

Бэкенд запустится на: `http://localhost:8020`  
Документация: `http://localhost:8020/docs`

---

## Запуск фронтенда (React):

### Требования:
- Node.js (v16 или выше)
- npm

### Установка и запуск:

```bash
cd frontend
npm install
npm run dev
```

Фронтенд запустится на: `http://localhost:3000`

---

## Как работает приложение:

1. Пользователь проходит пошаговую форму
2. Данные отправляются на `http://localhost:8020/predict`
3. Модель ***CatBoost*** делает предсказание
4. Результат отображается: **высокий** или **низкий риск**


> Прогноз основан на вероятности:  
> - **Высокий риск**, если `P(1) >= 0.365`  
> - **Низкий риск**, если `P(0) < 0.365`

---

## Зависимости:

### Backend (`backend/requirements.txt`)
```
fastapi>=0.104.0
uvicorn>=0.23.0
catboost>=1.2.0
```

### Frontend (`frontend/package.json`)
- React
- Vite

---

## Примечания:

- Приложение работает локально.
- CORS настроен на `http://localhost:3000`.