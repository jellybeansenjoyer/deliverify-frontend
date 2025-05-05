import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import SendLocation from './SendLocation.tsx';
// import ShowMap from './ShowMap'; // optional

const App = () => {
  return (
    <SafeAreaView>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Deliverify: Rider Appsss
      </Text>
      <SendLocation orderId="ORDER123" riderId="RIDER001" />
      {/* <ShowMap /> */}
    </SafeAreaView>
  );
};

export default App;
