package com.sliit.smart_campus.security;

import com.sliit.smart_campus.entity.Role;
import com.sliit.smart_campus.entity.User;
import com.sliit.smart_campus.repository.RoleRepository;
import com.sliit.smart_campus.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomOAuth2UserService(UserRepository userRepository,
                                   RoleRepository roleRepository,
                                   PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = delegate.loadUser(userRequest);
        Map<String, Object> attributes = new LinkedHashMap<>(oauth2User.getAttributes());

        String email = (String) attributes.get("email");
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Email is required from OAuth2 provider");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> createUser(attributes, email));
        updateUserFromOAuth2(user, attributes);

        Set<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toSet());

        return new DefaultOAuth2User(authorities, attributes, "email");
    }

    private User createUser(Map<String, Object> attributes, String email) {
        User user = new User();
        user.setUsername(email);
        user.setEmail(email);
        user.setEnabled(true);
        user.setFirstName((String) attributes.getOrDefault("given_name", ""));
        user.setLastName((String) attributes.getOrDefault("family_name", ""));
        user.setPasswordHash(passwordEncoder.encode("oauth2user"));

        Role defaultRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_USER, "Default authenticated user")));
        user.setRoles(Set.of(defaultRole));
        return userRepository.save(user);
    }

    private void updateUserFromOAuth2(User user, Map<String, Object> attributes) {
        user.setFirstName((String) attributes.getOrDefault("given_name", user.getFirstName()));
        user.setLastName((String) attributes.getOrDefault("family_name", user.getLastName()));
        userRepository.save(user);
    }
}
