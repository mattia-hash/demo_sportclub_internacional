import { resolveCustomer } from "@/data/customers";
import styles from "./CustomerBar.module.css";

type Props = {
  customerId: string;
};

export function CustomerBar({ customerId }: Props) {
  const customer = resolveCustomer(customerId);

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.spacer} aria-hidden="true" />
        <div className={styles.user}>
          <span className={styles.avatar} aria-hidden="true">
            {(customer?.displayName ?? "?").slice(0, 1).toUpperCase()}
          </span>
          <div className={styles.meta}>
            <span className={styles.greeting}>Olá,</span>
            <span className={styles.name}>{customer.displayName}</span>
            <span className={styles.hint}>ID {customer.id}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
