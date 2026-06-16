package com.aisignapp.seeder;

import com.aisignapp.entity.Role;
import com.aisignapp.entity.User;
import com.aisignapp.repository.RoleRepository;
import com.aisignapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(2)
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Directly check if the specific admin email already exists
        if (userRepository.findByEmail("nanagyachie@gmail.com").isEmpty()) {
            Role adminRole = roleRepository.findByRoleName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

            User adminUser = User.builder()
                    .fullName("System Administrator")
                    .email("nanagyachie@gmail.com")
                    .password(passwordEncoder.encode("Admin123!"))
                    .phoneNumber("+233542011738")
                    .role(adminRole)
                    .build();

            userRepository.save(adminUser);
            System.out.println("✅ Seeded default ADMIN user: nanagyachie@gmail.com / Admin123!");
        } else {
            System.out.println("ℹ️ Admin user nanagyachie@gmail.com already exists – skipping.");
        }
    }
}