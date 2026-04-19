import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
    Body,
    PrimaryButton,
    ScreenContainer,
    Title,
    useAppPalette
} from '@/components/ui';
import { spacing } from '@/constants/design-system';
import { createItem, getItem, initDB } from '../../lib/db';

function stockOnHand(item: { quantity?: unknown } | null): number {
  if (!item || item.quantity === null || item.quantity === undefined) return 0;
  const n = Number(item.quantity);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export default function ScannerScreen() {
  const router = useRouter();
  const colors = useAppPalette();
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    initDB();
  }, []);

  if (!permission) {
    return (
      <ScreenContainer scrollable>
        <View style={styles.centerBlock}>
          <Title>Camera</Title>
          <Body muted>Preparing camera...</Body>
        </View>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer scrollable>
        <View style={styles.centerBlock}>
          <Title>Camera access needed</Title>
          <Body muted style={styles.permissionCopy}>
            Grant camera permission to scan barcodes and QR codes in the field.
          </Body>
          <PrimaryButton title="Allow camera" onPress={requestPermission} />
        </View>
      </ScreenContainer>
    );
  }

  const handleScan = async (data: string) => {
    if (locked) return;

    setLocked(true);
    
    // Check if item exists
    const existing = await getItem(data || '');
    
    if (!existing) {
      // Create new item if it doesn't exist
      await createItem(data, '');
    }
    
    // Navigate directly to edit page
    router.push({
      pathname: '/items/edit/[barcode]',
      params: { barcode: data },
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.canvas }]}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'code128'],
        }}
        onBarcodeScanned={({ data }) => handleScan(data)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  centerBlock: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing['3xl'],
  },
  permissionCopy: {
    marginBottom: spacing.sm,
  },
});
