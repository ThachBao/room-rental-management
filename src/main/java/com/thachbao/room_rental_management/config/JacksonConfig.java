package com.thachbao.room_rental_management.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.TimeZone;

@Configuration
public class JacksonConfig {

    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final ZoneId ZONE_VN = ZoneId.of("Asia/Ho_Chi_Minh");

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern(DATE_FORMAT);
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern(DATE_TIME_FORMAT);

        JavaTimeModule javaTimeModule = new JavaTimeModule();

        // 1. Serializers (Server -> Client)
        javaTimeModule.addSerializer(LocalDate.class, new LocalDateSerializer(dateFormatter));
        javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(dateTimeFormatter));

        // 2. Deserializers (Client -> Server) - Hỗ trợ đa định dạng (ISO có 'T', có khoảng trắng ' ', có/không có giây)
        javaTimeModule.addDeserializer(LocalDate.class, new FlexibleLocalDateDeserializer());
        javaTimeModule.addDeserializer(LocalDateTime.class, new FlexibleLocalDateTimeDeserializer());

        objectMapper.registerModule(javaTimeModule);
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.setTimeZone(TimeZone.getTimeZone(ZONE_VN));
        objectMapper.setDateFormat(new SimpleDateFormat(DATE_TIME_FORMAT));

        return objectMapper;
    }

    /**
     * Bộ giải mã đa năng cho LocalDate: Chấp nhận "yyyy-MM-dd", "dd-MM-yyyy", "yyyy/MM/dd", hoặc chuỗi ISO datetime
     */
    public static class FlexibleLocalDateDeserializer extends JsonDeserializer<LocalDate> {
        private static final DateTimeFormatter[] DATE_FORMATTERS = new DateTimeFormatter[] {
                DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy"),
                DateTimeFormatter.ofPattern("yyyy/MM/dd"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy")
        };

        @Override
        public LocalDate deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            String value = p.getText();
            if (value == null || value.trim().isEmpty()) {
                return null;
            }
            value = value.trim();

            // Nếu truyền cả datetime dạng ISO (vd: "2026-08-28T00:00:00" hoặc "2026-08-28 14:00:00")
            if (value.contains("T")) {
                value = value.split("T")[0];
            } else if (value.contains(" ")) {
                value = value.split(" ")[0];
            }

            for (DateTimeFormatter formatter : DATE_FORMATTERS) {
                try {
                    return LocalDate.parse(value, formatter);
                } catch (Exception ignored) {
                }
            }

            throw new IllegalArgumentException("Không thể đọc định dạng ngày: " + value);
        }
    }

    /**
     * Bộ giải mã đa năng cho LocalDateTime: Chấp nhận ISO có 'T' (HTML5 datetime-local), khoảng trắng ' ', hoặc Date-only
     */
    public static class FlexibleLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {
        private static final DateTimeFormatter[] DATE_TIME_FORMATTERS = new DateTimeFormatter[] {
                DateTimeFormatter.ISO_DATE_TIME,
                DateTimeFormatter.ISO_LOCAL_DATE_TIME,
                DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")
        };

        @Override
        public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            String value = p.getText();
            if (value == null || value.trim().isEmpty()) {
                return null;
            }
            value = value.trim();

            // Xử lý chuỗi có múi giờ UTC/Z (vd: 2026-09-21T07:08:00Z)
            if (value.endsWith("Z") || value.contains("+00:00") || value.contains("+07:00")) {
                try {
                    return Instant.parse(value).atZone(ZONE_VN).toLocalDateTime();
                } catch (Exception ignored) {
                }
            }

            // Thử lần lượt các format phổ biến
            for (DateTimeFormatter formatter : DATE_TIME_FORMATTERS) {
                try {
                    return LocalDateTime.parse(value, formatter);
                } catch (Exception ignored) {
                }
            }

            // Nếu chỉ truyền yyyy-MM-dd (date-only) -> Chuyển thành đầu ngày 00:00:00
            try {
                if (value.contains("T")) {
                    value = value.split("T")[0];
                }
                return LocalDate.parse(value).atStartOfDay();
            } catch (Exception ignored) {
            }

            throw new IllegalArgumentException("Không thể đọc định dạng ngày giờ: " + value);
        }
    }
}
