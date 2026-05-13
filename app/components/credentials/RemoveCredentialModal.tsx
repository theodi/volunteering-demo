"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ModalWrapper } from "../ModalWrapper";
import { Button } from "../Button";

export type RemoveCredentialModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    /** Title of the credential being removed */
    credentialTitle: string;
    /** Whether the removal is currently in progress */
    isRemoving?: boolean;
};

export function RemoveCredentialModal({
    isOpen,
    onClose,
    onConfirm,
    credentialTitle,
    isRemoving = false,
}: RemoveCredentialModalProps) {
    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            className="!max-w-md w-full !border-none !rounded-xl"
        >
            <div className="flex flex-col items-center gap-4 px-6 py-6 text-center">
                {/* Warning icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>

                {/* Title & description */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Remove Credential
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Are you sure you want to remove{" "}
                        <span className="font-medium text-gray-700">{credentialTitle}</span>{" "}
                        from your Pod? This action cannot be undone.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex w-full gap-3 pt-2">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={onClose}
                        disabled={isRemoving}
                        className="flex-1 rounded-md! border-gray-300! py-2.5! text-sm! font-medium!"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={onConfirm}
                        disabled={isRemoving}
                        className="flex-1 rounded-md! border-none! bg-red-600! py-2.5! text-sm! font-medium! text-white! hover:bg-red-700! disabled:opacity-50!"
                    >
                        {isRemoving ? "Removing…" : "Remove"}
                    </Button>
                </div>
            </div>
        </ModalWrapper>
    );
}
