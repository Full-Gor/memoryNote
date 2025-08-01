@echo off
echo Nettoyage du projet Memory Notes...
echo.

echo 1. Nettoyage du cache npm...
npm cache clean --force

echo 2. Suppression des node_modules...
rmdir /s /q node_modules

echo 3. Suppression du cache Expo...
npx expo r -c

echo 4. Réinstallation des dépendances...
npm install

echo 5. Vérification des dépendances Expo...
npx expo install --fix

echo.
echo Nettoyage terminé ! Vous pouvez maintenant lancer votre projet.
pause 