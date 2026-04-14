# NEXA — Project Instructions

## Quick Start
```bash
# Start Metro bundler
npx react-native start --port 8081

# Build + run Android (set JAVA_HOME and ANDROID_HOME first)
cd android && ./gradlew.bat app:installDebug -PreactNativeDevServerPort=8081

# TypeScript check
npx tsc --noEmit
```

## Stack
- React Native 0.85.1, React 19, TypeScript strict
- Zustand 5.x — ALWAYS use selector: `useNexaStore(s => s.field)`
- SafeAreaView from `react-native-safe-area-context` (NOT from react-native)
- Navigation: @react-navigation/native-stack wrapping bottom-tabs

## Rules
- Dark theme ONLY — bg #0D0B14, primary #7C5CFC
- StyleSheet.create for all styles — no inline objects
- useCallback on handlers, useMemo for derived data
- useNativeDriver: true for transform/opacity, false ONLY for width/height
- Haptic feedback on every user action
- ErrorBoundary wraps every screen via withErrorBoundary HOC
- All screens: SafeAreaView + ScrollView with paddingBottom for tab bar

## File Conventions
- Screens: `src/screens/{Name}Screen.tsx` (PascalCase)
- Components: `src/components/{Name}.tsx`
- Services: `src/services/{name}.ts` (camelCase)
- Store: single file `src/store/nexaStore.ts`
- Mock data: `src/store/mockData.ts`

## Adding a New Screen
1. Create `src/screens/NewScreen.tsx`
2. Import in `src/navigation/TabNavigator.tsx`
3. Add `<Stack.Screen name="New" component={withErrorBoundary(NewScreen, 'New')} />`
4. Navigate with `navigation.navigate('New' as never)`

## Current Stats
- 23 screens, 10 components, 3 services, 41 source files
- 19,518 lines of TypeScript, 0 errors
- 105 matches, 87 tipsters, 55 feed posts
- 49 exported types, 60+ store actions
