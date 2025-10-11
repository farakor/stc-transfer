#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для остановки серверов
stop_servers() {
    echo -e "${YELLOW}Остановка серверов...${NC}"
    
    # Остановка сервера на порту 3003 (frontend)
    if lsof -ti:3003 > /dev/null 2>&1; then
        echo -e "${RED}Остановка frontend сервера (порт 3003)...${NC}"
        lsof -ti:3003 | xargs kill -9
        echo -e "${GREEN}Frontend сервер остановлен${NC}"
    else
        echo -e "${YELLOW}Frontend сервер не запущен${NC}"
    fi
    
    # Остановка сервера на порту 3001 (backend)
    if lsof -ti:3001 > /dev/null 2>&1; then
        echo -e "${RED}Остановка backend сервера (порт 3001)...${NC}"
        lsof -ti:3001 | xargs kill -9
        echo -e "${GREEN}Backend сервер остановлен${NC}"
    else
        echo -e "${YELLOW}Backend сервер не запущен${NC}"
    fi
    
    echo -e "${GREEN}Все серверы остановлены${NC}"
}

# Функция для запуска серверов
start_servers() {
    echo -e "${YELLOW}Запуск серверов...${NC}"
    
    # Остановка существующих процессов
    stop_servers
    
    # Небольшая пауза
    sleep 2
    
    # Запуск backend сервера в фоне
    echo -e "${GREEN}Запуск backend сервера...${NC}"
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Небольшая пауза перед запуском frontend
    sleep 3
    
    # Запуск frontend сервера в фоне
    echo -e "${GREEN}Запуск frontend сервера...${NC}"
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo -e "${GREEN}Серверы запущены!${NC}"
    echo -e "${YELLOW}Backend PID: ${BACKEND_PID}${NC}"
    echo -e "${YELLOW}Frontend PID: ${FRONTEND_PID}${NC}"
    echo -e "${YELLOW}Для остановки используйте: ./server-control.sh stop${NC}"
    
    # Ожидание завершения процессов
    wait
}

# Функция для проверки статуса серверов
status_servers() {
    echo -e "${YELLOW}Проверка статуса серверов...${NC}"
    
    if lsof -ti:3001 > /dev/null 2>&1; then
        echo -e "${GREEN}Backend сервер запущен на порту 3001${NC}"
    else
        echo -e "${RED}Backend сервер не запущен${NC}"
    fi
    
    if lsof -ti:3003 > /dev/null 2>&1; then
        echo -e "${GREEN}Frontend сервер запущен на порту 3003${NC}"
    else
        echo -e "${RED}Frontend сервер не запущен${NC}"
    fi
}

# Функция для отображения помощи
show_help() {
    echo -e "${YELLOW}Использование:${NC}"
    echo -e "  ./server-control.sh start   - Запуск серверов"
    echo -e "  ./server-control.sh stop    - Остановка серверов"
    echo -e "  ./server-control.sh status  - Проверка статуса серверов"
    echo -e "  ./server-control.sh help    - Показать эту справку"
}

# Основная логика
case "$1" in
    start)
        start_servers
        ;;
    stop)
        stop_servers
        ;;
    status)
        status_servers
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Неизвестная команда: $1${NC}"
        show_help
        exit 1
        ;;
esac
