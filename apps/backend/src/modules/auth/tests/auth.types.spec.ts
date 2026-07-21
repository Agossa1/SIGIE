/**
 * Tests unitaires — Cohérence des types Auth avec le schéma SQL
 * Valide que les enums TypeScript et interfaces sont alignés sur 00_final_schema.sql
 */
import {
    Role, UserStatus, AccountType,
    User, UserPreferences, Credentials,
    UserSession, UserOTP, AuthUser,
    TokenPayload, UpdateUserDTO, LoginResponse
} from '../types/auth.types';

// ============================================================================
// 1. Enums alignés avec les types ENUM PostgreSQL
// ============================================================================

describe('AccountType enum — doit correspondre à type_account_enum', () => {
    const expectedValues = [
        'user', 'admin', 'organization', 'municipality', 'district',
        'neighborhood', 'field_agent', 'technician', 'partner', 'supplier', 'citizen'
    ];

    test('contient toutes les valeurs du schéma type_account_enum', () => {
        const enumValues = Object.values(AccountType);
        expectedValues.forEach(value => {
            expect(enumValues).toContain(value);
        });
    });

    test('contient exactement 11 valeurs (pas de valeur orpheline)', () => {
        expect(Object.values(AccountType).length).toBe(11);
    });

    test("inclut 'citizen' pour les signalements citoyens (citizen_reports)", () => {
        expect(AccountType.CITIZEN).toBe('citizen');
    });
});

describe('Role enum — doit correspondre à user_role_enum', () => {
    const expectedValues = [
        'super_admin', 'platform_admin', 'ministry', 'prefecture_director',
        'mayor', 'dst_manager', 'sgds_manager', 'supervisor',
        'team_leader', 'technician', 'viewer'
    ];

    test('contient toutes les valeurs du schéma user_role_enum (11 rôles)', () => {
        const enumValues = Object.values(Role);
        expect(enumValues.length).toBe(11);
        expectedValues.forEach(value => {
            expect(enumValues).toContain(value);
        });
    });

    test('chaque valeur est une chaîne snake_case cohérente', () => {
        Object.values(Role).forEach(role => {
            expect(role).toMatch(/^[a-z_]+$/);
        });
    });
});

describe('UserStatus enum — doit correspondre à user_status_enum', () => {
    const expectedValues = ['pending', 'active', 'suspended', 'disabled'];

    test('contient exactement 4 statuts', () => {
        expect(Object.values(UserStatus).length).toBe(4);
        expectedValues.forEach(value => {
            expect(Object.values(UserStatus)).toContain(value);
        });
    });
});

// ============================================================================
// 2. Interfaces alignées avec les colonnes SQL
// ============================================================================

describe('User interface — doit refléter la table users', () => {
    test("contient tous les champs obligatoires de la table 'users'", () => {
        const user: User = {
            id: 'uuid-1',
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean@example.com',
            type: AccountType.USER,
            status: UserStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // Vérifie que les propriétés optionnelles sont bien présentes dans le type
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('firstName');
        expect(user).toHaveProperty('lastName');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('type');
        expect(user).toHaveProperty('status');
    });

    test('accepte les champs territoriaux complets (region → neighborhood)', () => {
        const user: User = {
            id: 'uuid-1',
            firstName: 'Agent',
            lastName: 'Terrain',
            email: 'agent@terrain.bj',
            type: AccountType.TECHNICIAN,
            status: UserStatus.ACTIVE,
            organizationId: 'org-1',
            regionId: 'reg-1',
            municipalityId: 'mun-1',
            districtId: 'dist-1',
            neighborhoodId: 'neigh-1',
            department: 'Atlantique',
            createdBy: 'admin-uuid',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        expect(user.neighborhoodId).toBe('neigh-1');
        expect(user.createdBy).toBe('admin-uuid');
        expect(user.regionId).toBe('reg-1');
    });

    test('accepte le type CITIZEN pour les utilisateurs de citizen_reports', () => {
        const user: User = {
            id: 'uuid-citizen',
            firstName: 'Citoyen',
            lastName: 'Lambda',
            email: 'citoyen@example.com',
            type: AccountType.CITIZEN,
            status: UserStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        expect(user.type).toBe('citizen');
    });
});

describe('UserPreferences interface — doit refléter user_preferences', () => {
    test('contient les colonnes de la table user_preferences', () => {
        const prefs: UserPreferences = {
            language: 'fr',
            theme: 'light',
            notificationsEnabled: true,
            photoUrl: 'https://img.example.com/photo.jpg',
            fcmToken: 'fcm-token-123',
            lastLoginAt: new Date(),
        };
        expect(prefs.language).toBe('fr');
        expect(prefs.theme).toBe('light');
        expect(prefs.notificationsEnabled).toBe(true);
        expect(prefs.photoUrl).toBeDefined();
        expect(prefs.fcmToken).toBeDefined();
    });
});

describe('Credentials interface — doit refléter credentials', () => {
    test('contient id, userId, passwordHash + timestamps', () => {
        const cred: Credentials = {
            id: 'cred-1',
            userId: 'user-1',
            passwordHash: '$2b$10$...',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        expect(cred.passwordHash).toBeDefined();
        expect(cred.userId).toBe('user-1');
    });
});

describe('UserSession interface — doit refléter user_sessions', () => {
    test('contient token, ipAddress, userAgent, expiresAt', () => {
        const session: UserSession = {
            id: 'sess-1',
            userId: 'user-1',
            token: 'refresh-token-abc',
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
            expiresAt: new Date(Date.now() + 86400000),
            createdAt: new Date(),
        };
        expect(session.token).toBeDefined();
        expect(session.ipAddress).toBe('192.168.1.1');
    });
});

describe('UserOTP interface — doit refléter user_otps', () => {
    test("accepte les 3 types d'OTP documentés", () => {
        const validTypes = ['account_activation', 'password_reset', 'email_change'];
        const otp: UserOTP = {
            id: 'otp-1',
            userId: 'user-1',
            codeHash: 'hash123',
            otpType: 'account_activation',
            expiresAt: new Date(Date.now() + 3600000),
            verified: false,
            createdAt: new Date(),
        };
        expect(validTypes).toContain(otp.otpType);
        expect(otp.verified).toBe(false);
    });
});

// ============================================================================
// 3. Types composés
// ============================================================================

describe('AuthUser interface — agrégation correcte', () => {
    test('étend User + credentials + roles + sessions + otps', () => {
        const authUser: AuthUser = {
            id: 'user-1',
            firstName: 'Admin',
            lastName: 'Système',
            email: 'admin@sigie.bj',
            type: AccountType.ADMIN,
            status: UserStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
            roles: [Role.SUPER_ADMIN],
            credentials: {
                id: 'cred-1',
                userId: 'user-1',
                passwordHash: 'hash',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            sessions: [],
            otps: [],
            organizationId: 'org-1',
        };
        expect(authUser.roles).toContain(Role.SUPER_ADMIN);
        expect(authUser.credentials).toBeDefined();
        expect(authUser.sessions).toEqual([]);
    });
});

describe('TokenPayload interface — doit refléter le JWT payload', () => {
    test('contient tous les champs territoriaux pour le contexte utilisateur', () => {
        const payload: TokenPayload = {
            id: 'user-1',
            email: 'user@test.com',
            roles: [Role.TECHNICIAN],
            organizationId: 'org-1',
            regionId: 'reg-1',
            municipalityId: 'mun-1',
            districtId: 'dist-1',
            neighborhoodId: 'neigh-1',
            department: 'Littoral',
        };
        expect(payload.neighborhoodId).toBe('neigh-1');
        expect(payload.roles).toContain(Role.TECHNICIAN);
    });
});

describe('LoginResponse interface — structure de réponse auth', () => {
    test('expose accessToken + refreshToken sans credentials', () => {
        const response: LoginResponse = {
            user: {
                id: 'user-1',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@test.com',
                type: AccountType.USER,
                status: UserStatus.ACTIVE,
                createdAt: new Date(),
                updatedAt: new Date(),
                roles: [Role.VIEWER],
                sessions: [],
                otps: [],
            },
            accessToken: 'jwt-access-token',
            refreshToken: 'jwt-refresh-token',
        };
        // Vérifie que credentials n'est pas exposé dans la réponse
        expect((response.user as any).credentials).toBeUndefined();
        expect(response.accessToken).toBeDefined();
        expect(response.refreshToken).toBeDefined();
    });
});

describe('UpdateUserDTO interface — champs modifiables', () => {
    test('permet la mise à jour des champs de base', () => {
        const dto: UpdateUserDTO = {
            firstName: 'Nouveau',
            lastName: 'Nom',
            email: 'new@email.com',
            phone: '+22912345678',
            status: UserStatus.ACTIVE,
        };
        expect(dto.firstName).toBe('Nouveau');
        expect(dto.status).toBe(UserStatus.ACTIVE);
    });
});