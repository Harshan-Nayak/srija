import { Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function AppLayout() {
  const { isSignedIn } = useAuth();

  // If the user is not signed in, we don't want to render this layout
  if (!isSignedIn) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen
        name="home"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="plans"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="interior-design"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="room-selection"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="planners-list"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="cost-estimation"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="calculations"
        options={{
          headerShown: false,
        }}
      />
       <Stack.Screen
        name="budget-tracking"
        options={{
          headerShown: false,
        }}
      />
        <Stack.Screen
        name="project-details"
        options={{
          headerShown: false,
        }}
      />
        <Stack.Screen
        name="progress-tracking"
        options={{
          headerShown: false,
        }}
      />
         <Stack.Screen
        name="project-progress"
        options={{
          headerShown: false,
        }}
      />
          <Stack.Screen
        name="add-project"
        options={{
          headerShown: false,
        }}
      />
           <Stack.Screen
        name="material-catalog"
        options={{
          headerShown: false,
        }}
      />
           <Stack.Screen
        name="cost-catalog"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
    
  );
} 