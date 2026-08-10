export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div>
          <h2>iSkole</h2>
          <p>Learn. Practice. Connect.</p>
        </div>

        <p>© {new Date().getFullYear()} iSkole.online</p>
      </div>
    </footer>
  );
}