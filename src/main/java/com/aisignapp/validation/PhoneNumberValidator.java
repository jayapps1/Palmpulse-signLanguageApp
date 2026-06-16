package com.aisignapp.validation;

import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.NumberParseException;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {
    private final PhoneNumberUtil phoneNumberUtil = PhoneNumberUtil.getInstance();
    private static final String DEFAULT_REGION = "GH"; // Change to your primary region

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return false; // required
        }
        try {
            // Try parsing with default region if no leading '+'
            var parsed = phoneNumberUtil.parse(value, DEFAULT_REGION);
            return phoneNumberUtil.isValidNumber(parsed);
        } catch (NumberParseException e) {
            return false;
        }
    }
}