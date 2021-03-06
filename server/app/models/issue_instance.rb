# -*- encoding : utf-8 -*-

# Klasa pojedynczego zgłoszenia
#
# Posiada dodatkową metodę detach do odłączania zgłoszenia
# od zgłoszenia zbiorczego (Issue)
#
# === Pola
# [desc] opis szkody, +string+
# [latitide] szerokość geograficzna
# [longitude] długość geograficzna
# [notificar_email] e-mail zgłaszającego, +string+, jeżeli podany, musi być w poprawnym formacie
# [issue] zgłoszenie zbiorcze, do którego jest podpięte to zgłoszenie; musi zawsze istnieć
#
class IssueInstance < ActiveRecord::Base

  # belongs_to zamiast has_one, has_many ze względu na położenie klucza obcego
  belongs_to :address
  belongs_to :issue

  has_many :photos

  accepts_nested_attributes_for :address

  # Nie może istnieć samodzielne IssueInstance
  validates :issue, :presence => true

  # Walidacja adresu e-mail
  validates :notificar_email, :format => { :with =>
    /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i,
    :message => "Błędny adres e-mail" }, :if => "!notificar_email.blank?"

  # Jeżeli istnieje taka sytuacja, gdy Issue zawiera kilka IssueInstances, ale
  # jedno z nich nie pasuje (a system uznał, ze to jest to samo zgłoszenie) można
  # je odłączyć
  #
  # Ta funkcja utworzy nowe Issue oraz przepnie do niego to IssueInstance.
  # To Issue bedzie lekko przesunięte, aby markery sie nie nałożyły na siebie
  def detach
    IssueInstance.transaction do
      new_issue = Issue.new :longitude => self.longitude + 0.00001, :latitude => self.latitude + 0.00001,
        :status => self.issue.status, :category => self.issue.category,
        :unit => self.issue.unit, :desc => self.desc

      new_issue.address = Address.create_by_position(self.latitude, self.longitude)

      new_issue.save!

      self.issue = new_issue
      self.save
    end
  end

end
