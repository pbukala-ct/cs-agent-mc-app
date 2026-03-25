import React, { useState } from 'react';
import TextField from '@commercetools-uikit/text-field';
import SelectField from '@commercetools-uikit/select-field';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import IconButton from '@commercetools-uikit/icon-button';
import { CopyIcon } from '@commercetools-uikit/icons';
import { InfoDialog } from '@commercetools-frontend/application-components';
import type { AgentRecord, AgentRole } from '../lib/types';
import { useCtClient } from '../lib/useCtClient';
import { generatePassword, hashPassword } from '../lib/password';

interface AgentFormProps {
  mode: 'create' | 'edit';
  agentKey?: string;
  initial?: Partial<AgentRecord>;
  onSuccess: () => void;
  onCancel: () => void;
}

const ROLE_OPTIONS = [
  { value: 'read-only', label: 'Read-only' },
  { value: 'order-placement', label: 'Order placement' },
];

export default function AgentForm({
  mode,
  agentKey,
  initial,
  onSuccess,
  onCancel,
}: AgentFormProps) {
  const ct = useCtClient();
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [role, setRole] = useState<AgentRole>(initial?.role ?? 'read-only');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'Invalid email address';
    if (!role) next.role = 'Role is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});

    try {
      if (mode === 'create') {
        // Check email uniqueness
        const existing = await ct.listAgents();
        const duplicate = existing.find(
          (a) => a.value.email.toLowerCase() === email.toLowerCase()
        );
        if (duplicate) {
          setErrors({ email: 'An agent with this email already exists' });
          return;
        }

        const plain = generatePassword();
        const passwordHash = hashPassword(plain);
        const now = new Date().toISOString();
        const key = email.toLowerCase().replace(/[^a-z0-9]/g, '-');

        await ct.upsertAgent(key, {
          agentId: key,
          email,
          passwordHash,
          role,
          name: name.trim(),
          active: true,
          createdAt: now,
        });

        setGeneratedPassword(plain);
      } else {
        // Edit mode — update name, email, role only
        if (!agentKey || !initial) return;
        await ct.upsertAgent(agentKey, {
          ...(initial as AgentRecord),
          name: name.trim(),
          email,
          role,
        });
        onSuccess();
      }
    } catch (e) {
      setErrors({ submit: e instanceof Error ? e.message : 'Failed to save agent' });
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopy() {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Spacings.Stack scale="m">
          <TextField
            title="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            errors={errors.name ? { missing: errors.name } : undefined}
            isRequired
          />
          <TextField
            title="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            errors={errors.email ? { missing: errors.email } : undefined}
            isRequired
          />
          <SelectField
            title="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as AgentRole)}
            options={ROLE_OPTIONS}
            errors={errors.role ? { missing: errors.role } : undefined}
            isRequired
          />
          {errors.submit && <Text.Body tone="critical">{errors.submit}</Text.Body>}
          <Spacings.Inline>
            <PrimaryButton
              label={mode === 'create' ? 'Create agent' : 'Save changes'}
              type="submit"
              isDisabled={submitting}
            />
            <SecondaryButton label="Cancel" onClick={onCancel} />
          </Spacings.Inline>
        </Spacings.Stack>
      </form>

      {generatedPassword && (
        <InfoDialog
          title="Agent created — save this password"
          isOpen
          onClose={() => {
            setGeneratedPassword(null);
            onSuccess();
          }}
        >
          <Spacings.Stack scale="m">
            <Text.Body>
              Share this one-time password with the agent. It cannot be retrieved
              again after you close this dialog.
            </Text.Body>
            <Spacings.Inline alignItems="center">
              <code
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#f5f5f5',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  fontSize: 16,
                  letterSpacing: 1,
                }}
              >
                {generatedPassword}
              </code>
              <IconButton
                icon={<CopyIcon />}
                label={copied ? 'Copied!' : 'Copy to clipboard'}
                onClick={handleCopy}
              />
            </Spacings.Inline>
            {copied && <Text.Body tone="positive">Copied to clipboard</Text.Body>}
            <PrimaryButton
              label="Done"
              onClick={() => {
                setGeneratedPassword(null);
                onSuccess();
              }}
            />
          </Spacings.Stack>
        </InfoDialog>
      )}
    </>
  );
}
