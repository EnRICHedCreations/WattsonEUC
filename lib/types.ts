export interface GpsRoutePoint {
  lat: number;
  lon: number;
  timestampMillis: number;
}

export interface TelemetryPointDto {
  timestampMillis: number;
  speedKmh: number;
  pwmPercent: number;
  batteryPercent: number;
  voltage: number;
  current: number;
  powerWatts: number;
}

export interface SharedRide {
  id: string;
  created_at: string;
  rider_nickname: string | null;
  wheel_brand: string;
  wheel_model: string;
  ride_start_time_millis: number;
  distance_meters: number;
  max_speed_kmh: number;
  avg_speed_kmh: number;
  max_pwm_percent: number;
  max_current_amps: number;
  max_power_watts: number;
  max_motor_temp_celsius: number | null;
  elevation_gain_meters: number;
  start_battery_percent: number;
  end_battery_percent: number | null;
  gps_route: GpsRoutePoint[];
  telemetry: TelemetryPointDto[];
}

/** Shape the Android app POSTs to /api/rides when uploading a ride to share. */
export interface UploadRideRequest {
  riderNickname?: string;
  wheelBrand: string;
  wheelModel: string;
  rideStartTimeMillis: number;
  distanceMeters: number;
  maxSpeedKmh: number;
  avgSpeedKmh: number;
  maxPwmPercent: number;
  maxCurrentAmps: number;
  maxPowerWatts: number;
  maxMotorTempCelsius?: number;
  elevationGainMeters: number;
  startBatteryPercent: number;
  endBatteryPercent?: number;
  gpsRoute: GpsRoutePoint[];
  telemetry: TelemetryPointDto[];
}
